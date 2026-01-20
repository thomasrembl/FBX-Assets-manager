import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import archiver from 'archiver'
import Store from 'electron-store'
import ffprobeStatic from 'ffprobe-static'
import { Jimp } from 'jimp'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'


// Configurer ffmpeg
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}
if (ffprobeStatic) {
  ffmpeg.setFfprobePath(ffprobeStatic.path)
}


const store = new Store()

// Dossier de stockage des assets
const getAssetsPath = () => {
  const userDataPath = app.getPath('userData')
  const assetsPath = path.join(userDataPath, 'assets')
  if (!fs.existsSync(assetsPath)) {
    fs.mkdirSync(assetsPath, { recursive: true })
  }
  return assetsPath
}
// Dossier de stockage des textures
const getTexturesPath = () => {
  const userDataPath = app.getPath('userData')
  const texturesPath = path.join(userDataPath, 'textures')
  if (!fs.existsSync(texturesPath)) {
    fs.mkdirSync(texturesPath, { recursive: true })
  }
  return texturesPath
}

// Dossier de stockage des stockshots
const getStockshotsPath = () => {
  const userDataPath = app.getPath('userData')
  const stockshotsPath = path.join(userDataPath, 'stockshots')
  if (!fs.existsSync(stockshotsPath)) {
    fs.mkdirSync(stockshotsPath, { recursive: true })
  }
  return stockshotsPath
}

// Dossier des thumbnails
const getThumbnailsPath = () => {
  const userDataPath = app.getPath('userData')
  const thumbsPath = path.join(userDataPath, 'thumbnails')
  if (!fs.existsSync(thumbsPath)) {
    fs.mkdirSync(thumbsPath, { recursive: true })
  }
  return thumbsPath
}
// Générer thumbnail pour vidéo (frame à 10%)
async function generateVideoThumbnail(videoPath: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%'],
        filename: 'thumbnail.png',
        folder: path.dirname(outputPath),
        size: '512x?'
      })
      .on('end', () => resolve(true))
      .on('error', (err) => {
        console.error('Error generating video thumbnail:', err)
        resolve(false)
      })
  })
}

// Convertir image en PNG pour thumbnail
async function convertToThumbnail(inputPath: string, outputPath: string): Promise<boolean> {
  const ext = path.extname(inputPath).toLowerCase()
  
  // Pour les EXR/HDR/TGA, utiliser ffmpeg
  if (['.exr', '.hdr', '.tga'].includes(ext)) {
    return new Promise((resolve) => {
      ffmpeg(inputPath)
        .outputOptions(['-vf', 'scale=512:-1:flags=lanczos', '-y'])
        .output(outputPath)
        .on('end', () => resolve(true))
        .on('error', (err) => {
          console.error('Error converting with ffmpeg:', err)
          resolve(false)
        })
        .run()
    })
  }
  
  // Pour les autres formats, utiliser Jimp
  try {
    const image = await Jimp.read(inputPath)
    image.scaleToFit({ w: 512, h: 512 })
    await image.write(outputPath as `${string}.${string}`)
    return true
  } catch (error) {
    // Fallback sur ffmpeg si Jimp échoue
    console.error('Jimp failed, trying ffmpeg:', error)
    return new Promise((resolve) => {
      ffmpeg(inputPath)
        .outputOptions(['-vf', 'scale=512:-1:flags=lanczos', '-y'])
        .output(outputPath)
        .on('end', () => resolve(true))
        .on('error', (err) => {
          console.error('Error converting with ffmpeg:', err)
          resolve(false)
        })
        .run()
    })
  }
}

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icon.ico'),
    backgroundColor: '#0d0f12',
    titleBarStyle: 'hiddenInset',
    frame: process.platform === 'darwin' ? true : false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // Dev ou Prod
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()
  
// Auto-update (uniquement en production)
if (app.isPackaged) {
  autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('update-status', 'Vérification des mises à jour...')
  })
  
  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update-status', 'Mise à jour disponible, téléchargement...')
  })
  
  autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('update-status', 'Aucune mise à jour disponible')
  })
  
  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('update-status', `Téléchargement: ${Math.round(progress.percent)}%`)
  })
  
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Mise à jour disponible',
      message: 'Une nouvelle version a été téléchargée. Redémarrer maintenant ?',
      buttons: ['Redémarrer', 'Plus tard']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })
  
  autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('update-status', 'Erreur: ' + err.message)
  })
  
  autoUpdater.checkForUpdatesAndNotify()
}
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ============== WINDOW CONTROLS ==============

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized()
})

// ============== IPC HANDLERS ==============

// Récupérer tous les assets
ipcMain.handle('get-assets', async () => {
  const assetsPath = getAssetsPath()
  const assets: Asset[] = store.get('assets', []) as Asset[]
  
  // Filtrer et nettoyer les orphelins
  const validAssets = assets.filter(asset => fs.existsSync(path.join(assetsPath, asset.id)))
  
  // Sauvegarder si on a nettoyé
  if (validAssets.length !== assets.length) {
    store.set('assets', validAssets)
  }
  
  return validAssets
})

// Importer un nouvel asset
ipcMain.handle('import-asset', async () => {
  // Sélectionner le FBX
  const fbxResult = await dialog.showOpenDialog(mainWindow!, {
    title: 'Sélectionner le fichier FBX',
    filters: [{ name: 'FBX', extensions: ['fbx'] }],
    properties: ['openFile'],
  })

  if (fbxResult.canceled || !fbxResult.filePaths[0]) {
    return { success: false, canceled: true }
  }

  const fbxPath = fbxResult.filePaths[0]
  const defaultName = path.basename(fbxPath, '.fbx')

  // Sélectionner les textures
  const texturesResult = await dialog.showOpenDialog(mainWindow!, {
    title: 'Sélectionner les textures (optionnel)',
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'tga', 'tiff', 'exr'] }],
    properties: ['openFile', 'multiSelections'],
  })

const texturePaths = texturesResult.canceled ? [] : texturesResult.filePaths

  return {
    success: true,
    fbxPath,
    texturePaths,
    defaultName,
  }
})

// Lire un fichier en base64
ipcMain.handle('read-file-base64', async (_event, filePath: string) => {
    try {
      const buffer = fs.readFileSync(filePath)
      return buffer.toString('base64')
    } catch (error) {
      console.error('Error reading file:', error)
      return null
    }
  })
  // Sauvegarder la thumbnail générée
  ipcMain.handle('save-thumbnail', async (_event, assetId: string, dataUrl: string) => {
    try {
      const assetsPath = getAssetsPath()
      const thumbnailPath = path.join(assetsPath, assetId, 'thumbnail.png')
      
      // Convertir base64 en buffer
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      
      // Sauvegarder
      fs.writeFileSync(thumbnailPath, buffer)
      
      return { success: true, path: thumbnailPath }
    } catch (error) {
      console.error('Error saving thumbnail:', error)
      return { success: false, error: String(error) }
    }
  })
  // ============== TEXTURES ==============

// Récupérer toutes les textures
ipcMain.handle('get-textures', async () => {
  const texturesPath = getTexturesPath()
  const textures: TextureAsset[] = store.get('textures', []) as TextureAsset[]
  
  // Filtrer et nettoyer les orphelins
  const validTextures = textures.filter(t => fs.existsSync(path.join(texturesPath, t.id)))
  
  // Sauvegarder si on a nettoyé
  if (validTextures.length !== textures.length) {
    store.set('textures', validTextures)
  }
  
  return validTextures
})

// Importer des textures
ipcMain.handle('import-textures', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Sélectionner les textures',
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'tga', 'tiff', 'tif', 'exr', 'hdr', 'bmp'] }],
    properties: ['openFile', 'multiSelections'],
  })

  if (result.canceled || !result.filePaths.length) {
    return { success: false, canceled: true }
  }

  const defaultName = path.basename(result.filePaths[0], path.extname(result.filePaths[0]))

  return {
    success: true,
    filePaths: result.filePaths,
    defaultName,
  }
})

// Sauvegarder une texture
ipcMain.handle('save-texture', async (_event, data: { filePaths: string[]; name: string }) => {
  const { filePaths, name } = data
  const texturesPath = getTexturesPath()
  const textureId = uuidv4()
  const textureDir = path.join(texturesPath, textureId)

  try {
    fs.mkdirSync(textureDir, { recursive: true })

    const savedFiles: string[] = []
    for (const filePath of filePaths) {
      const fileName = path.basename(filePath)
      fs.copyFileSync(filePath, path.join(textureDir, fileName))
      savedFiles.push(fileName)
    }

    // Générer thumbnail depuis la première image
    const thumbnailPath = path.join(textureDir, 'thumbnail.png')
    const firstImage = path.join(textureDir, savedFiles[0])

    try {
      await convertToThumbnail(firstImage, thumbnailPath)
    } catch (thumbError) {
      console.error('Error generating texture thumbnail:', thumbError)
    }


    const texture: TextureAsset = {
      id: textureId,
      name,
      files: savedFiles,
      fileCount: savedFiles.length,
      createdAt: new Date().toISOString(),
      thumbnailPath: null,
    }

    const textures = store.get('textures', []) as TextureAsset[]
    textures.push(texture)
    store.set('textures', textures)

    return { success: true, asset: texture }
  } catch (error) {
    console.error('Error saving texture:', error)
    return { success: false, error: String(error) }
  }
})

// Télécharger une texture
ipcMain.handle('download-texture', async (_event, textureId: string) => {
  const textures = store.get('textures', []) as TextureAsset[]
  const texture = textures.find(t => t.id === textureId)

  if (!texture) {
    return { success: false, error: 'Texture not found' }
  }

  const texturesPath = getTexturesPath()
  const textureDir = path.join(texturesPath, textureId)

  const saveResult = await dialog.showSaveDialog(mainWindow!, {
    title: 'Enregistrer la texture',
    defaultPath: `${texture.name}.zip`,
    filters: [{ name: 'Archive ZIP', extensions: ['zip'] }],
  })

  if (saveResult.canceled || !saveResult.filePath) {
    return { success: false, canceled: true }
  }

  try {
    await createZip(textureDir, saveResult.filePath)
    return { success: true }
  } catch (error) {
    console.error('Error creating zip:', error)
    return { success: false, error: String(error) }
  }
})

// Supprimer une texture
ipcMain.handle('delete-texture', async (_event, textureId: string) => {
  const texturesPath = getTexturesPath()
  const textureDir = path.join(texturesPath, textureId)

  try {
    if (fs.existsSync(textureDir)) {
      fs.rmSync(textureDir, { recursive: true })
    }

    const textures = store.get('textures', []) as TextureAsset[]
    const filtered = textures.filter(t => t.id !== textureId)
    store.set('textures', filtered)

    return { success: true }
  } catch (error) {
    console.error('Error deleting texture:', error)
    return { success: false, error: String(error) }
  }
})

// Renommer une texture
ipcMain.handle('rename-texture', async (_event, textureId: string, newName: string) => {
  try {
    const textures = store.get('textures', []) as TextureAsset[]
    const index = textures.findIndex(t => t.id === textureId)
    
    if (index === -1) {
      return { success: false, error: 'Texture not found' }
    }
    
    textures[index].name = newName
    store.set('textures', textures)
    
    return { success: true }
  } catch (error) {
    console.error('Error renaming texture:', error)
    return { success: false, error: String(error) }
  }
})

// Récupérer la thumbnail d'une texture
ipcMain.handle('get-texture-thumbnail', async (_event, textureId: string) => {
  const texturesPath = getTexturesPath()
  const textureDir = path.join(texturesPath, textureId)

  const thumbnailPath = path.join(textureDir, 'thumbnail.png')
  if (fs.existsSync(thumbnailPath)) {
    return thumbnailPath
  }

  // Fallback : première image
  const files = fs.readdirSync(textureDir)
  const imageFile = files.find(f => /\.(png|jpg|jpeg|tga|tiff|tif|exr|hdr|bmp)$/i.test(f))
  
  if (imageFile) {
    return path.join(textureDir, imageFile)
  }

  return null
})

// ============== STOCKSHOTS ==============

// Récupérer tous les stockshots
ipcMain.handle('get-stockshots', async () => {
  const stockshotsPath = getStockshotsPath()
  const stockshots: StockshotAsset[] = store.get('stockshots', []) as StockshotAsset[]
  
  // Filtrer et nettoyer les orphelins
  const validStockshots = stockshots.filter(s => fs.existsSync(path.join(stockshotsPath, s.id)))
  
  // Sauvegarder si on a nettoyé
  if (validStockshots.length !== stockshots.length) {
    store.set('stockshots', validStockshots)
  }
  
  return validStockshots
})

// Importer des stockshots
// Importer des stockshots
ipcMain.handle('import-stockshot', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Sélectionner vidéo ou fichier(s) de la séquence',
    filters: [
      { name: 'Vidéos & Images', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'png', 'jpg', 'jpeg', 'exr', 'tiff', 'tif'] }
    ],
    properties: ['openFile', 'multiSelections'],
  })

  if (result.canceled || !result.filePaths.length) {
    return { success: false, canceled: true }
  }

  const firstFile = result.filePaths[0]
  const ext = path.extname(firstFile).toLowerCase()
  const isVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)

  let filePaths: string[] = []
  let defaultName: string
  let type: 'video' | 'sequence'

  if (isVideo) {
    filePaths = [firstFile]
    defaultName = path.basename(firstFile, ext)
    type = 'video'
  } else {
    // Si plusieurs fichiers sélectionnés, les utiliser directement
    if (result.filePaths.length > 1) {
      filePaths = result.filePaths.sort((a, b) => {
        const matchA = path.basename(a).match(/(\d+)/)
        const matchB = path.basename(b).match(/(\d+)/)
        const numA = matchA ? parseInt(matchA[1]) : 0
        const numB = matchB ? parseInt(matchB[1]) : 0
        return numA - numB
      })
      
      const fileName = path.basename(firstFile, ext)
      const sequenceMatch = fileName.match(/^(.+)\.(\d+)$/)
      defaultName = sequenceMatch ? sequenceMatch[1] : fileName
    } else {
      // Un seul fichier : tenter de détecter la séquence
      const dir = path.dirname(firstFile)
      const fileName = path.basename(firstFile, ext)
      const sequenceMatch = fileName.match(/^(.+)\.(\d+)$/)
      
      if (sequenceMatch) {
        const prefix = sequenceMatch[1]
        const allFiles = fs.readdirSync(dir)
        const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const escapedExt = ext.replace('.', '\\.')
        const sequenceRegex = new RegExp(`^${escapedPrefix}\\.(\\d+)${escapedExt}$`, 'i')
        
        filePaths = allFiles
          .filter(f => sequenceRegex.test(f))
          .map(f => path.join(dir, f))
          .sort((a, b) => {
            const matchA = path.basename(a).match(/\.(\d+)\./)
            const matchB = path.basename(b).match(/\.(\d+)\./)
            const numA = matchA ? parseInt(matchA[1]) : 0
            const numB = matchB ? parseInt(matchB[1]) : 0
            return numA - numB
          })
        
        defaultName = prefix
      } else {
        filePaths = [firstFile]
        defaultName = fileName
      }
    }
    
    type = 'sequence'
  }

  return {
    success: true,
    filePaths,
    defaultName,
    type,
    frameCount: filePaths.length,
  }
})

// Sauvegarder un stockshot
// Sauvegarder un stockshot
ipcMain.handle('save-stockshot', async (_event, data: { filePaths: string[]; name: string; type: 'video' | 'sequence' }) => {
  const { filePaths, name, type } = data
  const stockshotsPath = getStockshotsPath()
  const stockshotId = uuidv4()
  const stockshotDir = path.join(stockshotsPath, stockshotId)

  try {
    fs.mkdirSync(stockshotDir, { recursive: true })

    const savedFiles: string[] = []
    const total = filePaths.length
    
    // Envoyer la progression au renderer
    mainWindow?.webContents.send('import-progress', { current: 0, total, status: 'Copie des fichiers...' })
    
    // Copier les fichiers par lots
    const batchSize = 10
    for (let i = 0; i < filePaths.length; i += batchSize) {
      const batch = filePaths.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async (filePath) => {
        const fileName = path.basename(filePath)
        await fs.promises.copyFile(filePath, path.join(stockshotDir, fileName))
        savedFiles.push(fileName)
      }))
      
      // Update progression
      mainWindow?.webContents.send('import-progress', { 
        current: Math.min(i + batchSize, total), 
        total, 
        status: `Copie des fichiers... ${Math.min(i + batchSize, total)}/${total}` 
      })
    }

    // Trier les fichiers pour les séquences
    if (type === 'sequence') {
      savedFiles.sort((a, b) => {
        const matchA = a.match(/(\d+)/)
        const matchB = b.match(/(\d+)/)
        const numA = matchA ? parseInt(matchA[1]) : 0
        const numB = matchB ? parseInt(matchB[1]) : 0
        return numA - numB
      })
    }

    mainWindow?.webContents.send('import-progress', { current: total, total, status: 'Génération de la thumbnail...' })

    const stockshot: StockshotAsset = {
      id: stockshotId,
      name,
      type,
      files: savedFiles,
      frameCount: type === 'video' ? 1 : savedFiles.length,
      createdAt: new Date().toISOString(),
      thumbnailPath: null,
    }

    // Générer la thumbnail
    const thumbnailPath = path.join(stockshotDir, 'thumbnail.png')
    
    if (type === 'video') {
      const videoPath = path.join(stockshotDir, savedFiles[0])
      await generateVideoThumbnail(videoPath, thumbnailPath)
    } else {
      const frameIndex = Math.max(0, Math.floor(savedFiles.length * 0.1))
      const framePath = path.join(stockshotDir, savedFiles[frameIndex])
      await convertToThumbnail(framePath, thumbnailPath)
    }

    const stockshots = store.get('stockshots', []) as StockshotAsset[]
    stockshots.push(stockshot)
    store.set('stockshots', stockshots)

    mainWindow?.webContents.send('import-progress', null)

    return { success: true, asset: stockshot }
  } catch (error) {
    console.error('Error saving stockshot:', error)
    mainWindow?.webContents.send('import-progress', null)
    return { success: false, error: String(error) }
  }
})


// Télécharger un stockshot
ipcMain.handle('download-stockshot', async (_event, stockshotId: string) => {
  const stockshots = store.get('stockshots', []) as StockshotAsset[]
  const stockshot = stockshots.find(s => s.id === stockshotId)

  if (!stockshot) {
    return { success: false, error: 'Stockshot not found' }
  }

  const stockshotsPath = getStockshotsPath()
  const stockshotDir = path.join(stockshotsPath, stockshotId)

  const saveResult = await dialog.showSaveDialog(mainWindow!, {
    title: 'Enregistrer le stockshot',
    defaultPath: `${stockshot.name}.zip`,
    filters: [{ name: 'Archive ZIP', extensions: ['zip'] }],
  })

  if (saveResult.canceled || !saveResult.filePath) {
    return { success: false, canceled: true }
  }

  try {
    await createZip(stockshotDir, saveResult.filePath)
    return { success: true }
  } catch (error) {
    console.error('Error creating zip:', error)
    return { success: false, error: String(error) }
  }
})

// Supprimer un stockshot
ipcMain.handle('delete-stockshot', async (_event, stockshotId: string) => {
  const stockshotsPath = getStockshotsPath()
  const stockshotDir = path.join(stockshotsPath, stockshotId)

  try {
    if (fs.existsSync(stockshotDir)) {
      fs.rmSync(stockshotDir, { recursive: true })
    }

    const stockshots = store.get('stockshots', []) as StockshotAsset[]
    const filtered = stockshots.filter(s => s.id !== stockshotId)
    store.set('stockshots', filtered)

    return { success: true }
  } catch (error) {
    console.error('Error deleting stockshot:', error)
    return { success: false, error: String(error) }
  }
})

// Renommer un stockshot
ipcMain.handle('rename-stockshot', async (_event, stockshotId: string, newName: string) => {
  try {
    const stockshots = store.get('stockshots', []) as StockshotAsset[]
    const index = stockshots.findIndex(s => s.id === stockshotId)
    
    if (index === -1) {
      return { success: false, error: 'Stockshot not found' }
    }
    
    stockshots[index].name = newName
    store.set('stockshots', stockshots)
    
    return { success: true }
  } catch (error) {
    console.error('Error renaming stockshot:', error)
    return { success: false, error: String(error) }
  }
})

// Récupérer la thumbnail d'un stockshot
ipcMain.handle('get-stockshot-thumbnail', async (_event, stockshotId: string) => {
  const stockshotsPath = getStockshotsPath()
  const stockshotDir = path.join(stockshotsPath, stockshotId)

  const thumbnailPath = path.join(stockshotDir, 'thumbnail.png')
  if (fs.existsSync(thumbnailPath)) {
    return thumbnailPath
  }

  return null
})

// Récupérer une frame d'un stockshot pour générer la thumbnail
ipcMain.handle('get-stockshot-frame', async (_event, stockshotId: string, framePercent: number) => {
  const stockshots = store.get('stockshots', []) as StockshotAsset[]
  const stockshot = stockshots.find(s => s.id === stockshotId)
  
  if (!stockshot) return null

  const stockshotsPath = getStockshotsPath()
  const stockshotDir = path.join(stockshotsPath, stockshotId)

  if (stockshot.type === 'sequence') {
    const frameIndex = Math.floor(stockshot.files.length * framePercent)
    const framePath = path.join(stockshotDir, stockshot.files[frameIndex])
    if (fs.existsSync(framePath)) {
      return framePath
    }
  }

  return null
})



// Sauvegarder l'asset avec le nom
ipcMain.handle('save-asset', async (_event, data: { fbxPath: string; texturePaths: string[]; name: string }) => {
  const { fbxPath, texturePaths, name } = data
  const assetsPath = getAssetsPath()
  const assetId = uuidv4()
  const assetDir = path.join(assetsPath, assetId)

  try {
    // Créer le dossier de l'asset
    fs.mkdirSync(assetDir, { recursive: true })
    fs.mkdirSync(path.join(assetDir, 'textures'), { recursive: true })

    // Copier le FBX
    const fbxFileName = path.basename(fbxPath)
    fs.copyFileSync(fbxPath, path.join(assetDir, fbxFileName))

    // Copier les textures
    for (const texturePath of texturePaths) {
      const textureFileName = path.basename(texturePath)
      fs.copyFileSync(texturePath, path.join(assetDir, 'textures', textureFileName))
    }

    // Créer l'entrée dans le store
    const asset: Asset = {
      id: assetId,
      name,
      fbxFileName,
      textureCount: texturePaths.length,
      createdAt: new Date().toISOString(),
      thumbnailPath: null,
    }

    const assets = store.get('assets', []) as Asset[]
    assets.push(asset)
    store.set('assets', assets)

    return { success: true, asset }
  } catch (error) {
    console.error('Error saving asset:', error)
    return { success: false, error: String(error) }
  }
})

// Télécharger (exporter) un asset en ZIP
ipcMain.handle('download-asset', async (_event, assetId: string) => {
  const assets = store.get('assets', []) as Asset[]
  const asset = assets.find(a => a.id === assetId)

  if (!asset) {
    return { success: false, error: 'Asset not found' }
  }

  const assetsPath = getAssetsPath()
  const assetDir = path.join(assetsPath, assetId)

  // Demander où sauvegarder
  const saveResult = await dialog.showSaveDialog(mainWindow!, {
    title: 'Enregistrer l\'asset',
    defaultPath: `${asset.name}.zip`,
    filters: [{ name: 'Archive ZIP', extensions: ['zip'] }],
  })

  if (saveResult.canceled || !saveResult.filePath) {
    return { success: false, canceled: true }
  }

  try {
    await createZip(assetDir, saveResult.filePath)
    return { success: true }
  } catch (error) {
    console.error('Error creating zip:', error)
    return { success: false, error: String(error) }
  }
})

// Supprimer un asset
ipcMain.handle('delete-asset', async (_event, assetId: string) => {
  const assetsPath = getAssetsPath()
  const assetDir = path.join(assetsPath, assetId)

  try {
    // Supprimer les fichiers
    if (fs.existsSync(assetDir)) {
      fs.rmSync(assetDir, { recursive: true })
    }

    // Supprimer du store
    const assets = store.get('assets', []) as Asset[]
    const filtered = assets.filter(a => a.id !== assetId)
    store.set('assets', filtered)

    return { success: true }
  } catch (error) {
    console.error('Error deleting asset:', error)
    return { success: false, error: String(error) }
  }
})


// Récupérer le chemin d'une texture pour l'afficher (thumbnail)
// Récupérer le chemin d'une texture pour l'afficher (thumbnail)
ipcMain.handle('get-asset-thumbnail', async (_event, assetId: string) => {
  const assetsPath = getAssetsPath()
  const assetDir = path.join(assetsPath, assetId)

  // D'abord chercher la thumbnail générée
  const thumbnailPath = path.join(assetDir, 'thumbnail.png')
  if (fs.existsSync(thumbnailPath)) {
    return thumbnailPath
  }

  // Sinon fallback sur la première texture
  const texturesDir = path.join(assetDir, 'textures')
  if (!fs.existsSync(texturesDir)) {
    return null
  }

  const files = fs.readdirSync(texturesDir)
  const imageFile = files.find(f => /\.(png|jpg|jpeg)$/i.test(f))

  if (imageFile) {
    return path.join(texturesDir, imageFile)
  }

  return null
})
// Renommer un asset
ipcMain.handle('rename-asset', async (_event, assetId: string, newName: string) => {
  try {
    const assets = store.get('assets', []) as Asset[]
    const assetIndex = assets.findIndex(a => a.id === assetId)
    
    if (assetIndex === -1) {
      return { success: false, error: 'Asset not found' }
    }
    
    assets[assetIndex].name = newName
    store.set('assets', assets)
    
    return { success: true }
  } catch (error) {
    console.error('Error renaming asset:', error)
    return { success: false, error: String(error) }
  }
})

// Lire un fichier image en base64 pour l'afficher
ipcMain.handle('read-image-base64', async (_event, imagePath: string) => {
  try {
    const buffer = fs.readFileSync(imagePath)
    const ext = path.extname(imagePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
    }
    const mime = mimeTypes[ext] || 'image/png'
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
})

// Fonction utilitaire pour créer un ZIP
// Fonction utilitaire pour créer un ZIP
function createZip(sourceDir: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve())
    archive.on('error', (err) => reject(err))

    archive.pipe(output)
    
    // Ajouter tous les fichiers sauf thumbnail.png
    archive.glob('**/*', {
      cwd: sourceDir,
      ignore: ['thumbnail.png']
    })
    
    archive.finalize()
  })
}

// Types
interface Asset {
  id: string
  name: string
  fbxFileName: string
  textureCount: number
  createdAt: string
  thumbnailPath: string | null
}
interface TextureAsset {
  id: string
  name: string
  files: string[]
  fileCount: number
  createdAt: string
  thumbnailPath: string | null
}

interface StockshotAsset {
  id: string
  name: string
  type: 'video' | 'sequence'
  files: string[]
  frameCount: number
  createdAt: string
  thumbnailPath: string | null
}

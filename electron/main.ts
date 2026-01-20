import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import archiver from 'archiver'
import Store from 'electron-store'

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

// Dossier des thumbnails
const getThumbnailsPath = () => {
  const userDataPath = app.getPath('userData')
  const thumbsPath = path.join(userDataPath, 'thumbnails')
  if (!fs.existsSync(thumbsPath)) {
    fs.mkdirSync(thumbsPath, { recursive: true })
  }
  return thumbsPath
}

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
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
    autoUpdater.checkForUpdatesAndNotify()
    
    autoUpdater.on('update-available', () => {
      mainWindow?.webContents.send('update-status', 'Une mise à jour est disponible, téléchargement en cours...')
    })
    
    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox(mainWindow!, {
        type: 'info',
        title: 'Mise à jour disponible',
        message: 'Une nouvelle version a été téléchargée. Redémarrer maintenant pour l\'installer ?',
        buttons: ['Redémarrer', 'Plus tard']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
    })
    
    autoUpdater.on('error', (err) => {
      console.error('Auto-update error:', err)
    })
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

// ============== IPC HANDLERS ==============

// Récupérer tous les assets
ipcMain.handle('get-assets', async () => {
  const assetsPath = getAssetsPath()
  const assets: Asset[] = store.get('assets', []) as Asset[]
  
  // Vérifier que les fichiers existent toujours
  return assets.filter(asset => fs.existsSync(path.join(assetsPath, asset.id)))
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

  // Demander le nom
  // Note: Electron n'a pas de dialog pour input text, on le fera côté renderer
  
  return {
    success: true,
    fbxPath,
    texturePaths,
    defaultName,
  }
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
ipcMain.handle('get-asset-thumbnail', async (_event, assetId: string) => {
  const assetsPath = getAssetsPath()
  const assetDir = path.join(assetsPath, assetId)
  const texturesDir = path.join(assetDir, 'textures')

  if (!fs.existsSync(texturesDir)) {
    return null
  }

  // Prendre la première texture comme thumbnail
  const files = fs.readdirSync(texturesDir)
  const imageFile = files.find(f => /\.(png|jpg|jpeg)$/i.test(f))

  if (imageFile) {
    return path.join(texturesDir, imageFile)
  }

  return null
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
function createZip(sourceDir: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve())
    archive.on('error', (err) => reject(err))

    archive.pipe(output)
    archive.directory(sourceDir, false)
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

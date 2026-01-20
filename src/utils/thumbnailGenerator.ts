import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export async function generateThumbnail(fbxPath: string): Promise<string | null> {
  // Lire le fichier via Electron
  const base64 = await window.electronAPI.readFileBase64(fbxPath)
  if (!base64) return null

  // Convertir en ArrayBuffer
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const arrayBuffer = bytes.buffer

  return new Promise((resolve) => {
    const width = 512
    const height = 512

    // Setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#2a2d34')

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      preserveDrawingBuffer: true 
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(1)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    // Lighting - plus intense
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2)
    keyLight.position.set(5, 10, 7)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 1)
    fillLight.position.set(-5, 5, -5)
    scene.add(fillLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5)
    backLight.position.set(0, 5, -10)
    scene.add(backLight)

    // Load FBX from ArrayBuffer
    const loader = new FBXLoader()
    
    try {
      const object = loader.parse(arrayBuffer, '')
      
      // Appliquer un matériau visible sur tous les meshes
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.5,
            metalness: 0.1,
          })
        }
      })
      
      // Center and scale
      const box = new THREE.Box3().setFromObject(object)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())
      
      object.position.sub(center)
      
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2 / maxDim
      object.scale.multiplyScalar(scale)
      
      const newBox = new THREE.Box3().setFromObject(object)
      object.position.y -= newBox.min.y
      
      scene.add(object)
      
      // Position camera
      camera.position.set(2, 1.5, 2)
      camera.lookAt(0, 0.5, 0)
      
      // Render
      renderer.render(scene, camera)
      
      // Get base64
      const dataUrl = renderer.domElement.toDataURL('image/png')
      
      // Cleanup
      renderer.dispose()
      
      resolve(dataUrl)
    } catch (error) {
      console.error('Error parsing FBX:', error)
      renderer.dispose()
      resolve(null)
    }
  })
}
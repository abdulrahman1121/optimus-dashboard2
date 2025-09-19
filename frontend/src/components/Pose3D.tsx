import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useTelemetryStore } from '../state/store'

const Pose3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const robotRef = useRef<THREE.Group | null>(null)
  const animationRef = useRef<number | null>(null)
  
  const { telemetry } = useTelemetryStore()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(3, 3, 3)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mountRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Create robot model
    const robot = new THREE.Group()
    robotRef.current = robot

    // Robot body (main torso)
    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4)
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x00d4ff })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.6
    body.castShadow = true
    robot.add(body)

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 1.5
    head.castShadow = true
    robot.add(head)

    // Left arm
    const leftArmGroup = new THREE.Group()
    leftArmGroup.position.set(-0.6, 1.0, 0)
    
    const leftShoulderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4)
    const leftShoulder = new THREE.Mesh(leftShoulderGeometry, bodyMaterial)
    leftShoulder.rotation.z = Math.PI / 2
    leftShoulder.castShadow = true
    leftArmGroup.add(leftShoulder)
    
    const leftElbowGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3)
    const leftElbow = new THREE.Mesh(leftElbowGeometry, bodyMaterial)
    leftElbow.position.set(-0.2, 0, 0)
    leftElbow.rotation.z = Math.PI / 2
    leftElbow.castShadow = true
    leftArmGroup.add(leftElbow)
    
    robot.add(leftArmGroup)

    // Right arm
    const rightArmGroup = new THREE.Group()
    rightArmGroup.position.set(0.6, 1.0, 0)
    
    const rightShoulderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4)
    const rightShoulder = new THREE.Mesh(rightShoulderGeometry, bodyMaterial)
    rightShoulder.rotation.z = Math.PI / 2
    rightShoulder.castShadow = true
    rightArmGroup.add(rightShoulder)
    
    const rightElbowGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3)
    const rightElbow = new THREE.Mesh(rightElbowGeometry, bodyMaterial)
    rightElbow.position.set(0.2, 0, 0)
    rightElbow.rotation.z = Math.PI / 2
    rightElbow.castShadow = true
    rightArmGroup.add(rightElbow)
    
    robot.add(rightArmGroup)

    // Left leg
    const leftLegGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8)
    const leftLeg = new THREE.Mesh(leftLegGeometry, bodyMaterial)
    leftLeg.position.set(-0.2, -0.4, 0)
    leftLeg.castShadow = true
    robot.add(leftLeg)

    // Right leg
    const rightLegGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8)
    const rightLeg = new THREE.Mesh(rightLegGeometry, bodyMaterial)
    rightLeg.position.set(0.2, -0.4, 0)
    rightLeg.castShadow = true
    robot.add(rightLeg)

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10)
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1
    ground.receiveShadow = true
    scene.add(ground)

    // Grid
    const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x222222)
    gridHelper.position.y = -0.99
    scene.add(gridHelper)

    scene.add(robot)

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      
      // Rotate robot slowly
      if (robot) {
        robot.rotation.y += 0.005
      }
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Update robot pose when telemetry changes
  useEffect(() => {
    if (!telemetry || !robotRef.current) return

    const { pose } = telemetry
    const robot = robotRef.current

    // Update position
    robot.position.set(pose.x, pose.z, pose.y)

    // Update rotation (convert to Three.js coordinate system)
    robot.rotation.set(pose.pitch, pose.yaw, pose.roll)

    // Update joint positions based on joint currents
    const { joints } = telemetry
    
    // Update arm positions based on joint currents
    const leftArm = robot.children.find(child => child.position.x < 0) as THREE.Group
    const rightArm = robot.children.find(child => child.position.x > 0) as THREE.Group
    
    if (leftArm && leftArm.children.length > 1) {
      const elbow = leftArm.children[1] as THREE.Mesh
      elbow.rotation.x = (joints.shoulder_l - 2.0) * 0.5
    }
    
    if (rightArm && rightArm.children.length > 1) {
      const elbow = rightArm.children[1] as THREE.Mesh
      elbow.rotation.x = (joints.shoulder_r - 2.0) * 0.5
    }
  }, [telemetry])

  return (
    <div className="pose-3d">
      <div ref={mountRef} className="pose-3d-canvas" />
      {telemetry && (
        <div className="pose-info">
          <div className="pose-coords">
            <div>X: {telemetry.pose.x.toFixed(3)}</div>
            <div>Y: {telemetry.pose.y.toFixed(3)}</div>
            <div>Z: {telemetry.pose.z.toFixed(3)}</div>
          </div>
          <div className="pose-rotation">
            <div>Roll: {(telemetry.pose.roll * 180 / Math.PI).toFixed(1)}°</div>
            <div>Pitch: {(telemetry.pose.pitch * 180 / Math.PI).toFixed(1)}°</div>
            <div>Yaw: {(telemetry.pose.yaw * 180 / Math.PI).toFixed(1)}°</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pose3D

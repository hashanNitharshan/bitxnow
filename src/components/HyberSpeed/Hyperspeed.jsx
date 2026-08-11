import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass
} from 'postprocessing'

import './Hyperspeed.css'

const DEFAULT_OPTIONS = {
  roadLength: 220,
  roadWidth: 18,
  laneCount: 4,
  speed: 38,
  lightCount: 90,
  yellow: 0xf0b90b,
  white: 0xffffff,
  road: 0x080808,
  background: 0x000000
}

function Hyperspeed({ effectOptions = {} }) {
  const containerRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const options = {
      ...DEFAULT_OPTIONS,
      ...effectOptions
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(options.background)

    scene.fog = new THREE.Fog(
      options.background,
      25,
      options.roadLength
    )

    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)

    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      500
    )

    camera.position.set(0, 5.2, 8)
    camera.lookAt(0, 0, -45)

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    })

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    )

    renderer.setSize(width, height, false)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    container.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.setSize(width, height)

    const renderPass = new RenderPass(scene, camera)

    const bloomEffect = new BloomEffect({
      intensity: 1.8,
      luminanceThreshold: 0.1,
      luminanceSmoothing: 0.4,
      mipmapBlur: true
    })

    const bloomPass = new EffectPass(
      camera,
      bloomEffect
    )

    composer.addPass(renderPass)
    composer.addPass(bloomPass)

    const disposableGeometries = []
    const disposableMaterials = []

    function registerGeometry(geometry) {
      disposableGeometries.push(geometry)
      return geometry
    }

    function registerMaterial(material) {
      disposableMaterials.push(material)
      return material
    }

    const roadGeometry = registerGeometry(
      new THREE.PlaneGeometry(
        options.roadWidth,
        options.roadLength,
        1,
        1
      )
    )

    const roadMaterial = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: options.road,
        side: THREE.DoubleSide
      })
    )

    const road = new THREE.Mesh(
      roadGeometry,
      roadMaterial
    )

    road.rotation.x = -Math.PI / 2

    road.position.set(
      0,
      0,
      -options.roadLength / 2 + 8
    )

    scene.add(road)

    const roadSideMaterial = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: options.yellow
      })
    )

    const roadSideGeometry = registerGeometry(
      new THREE.BoxGeometry(
        0.08,
        0.04,
        options.roadLength
      )
    )

    const leftRoadSide = new THREE.Mesh(
      roadSideGeometry,
      roadSideMaterial
    )

    leftRoadSide.position.set(
      -options.roadWidth / 2,
      0.04,
      -options.roadLength / 2 + 8
    )

    scene.add(leftRoadSide)

    const rightRoadSide = new THREE.Mesh(
      roadSideGeometry,
      roadSideMaterial
    )

    rightRoadSide.position.set(
      options.roadWidth / 2,
      0.04,
      -options.roadLength / 2 + 8
    )

    scene.add(rightRoadSide)

    const laneDashes = []

    const dashGeometry = registerGeometry(
      new THREE.BoxGeometry(0.09, 0.025, 3)
    )

    const dashMaterial = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: options.white
      })
    )

    const laneWidth =
      options.roadWidth / options.laneCount

    const dashSpacing = 8

    const dashRows = Math.ceil(
      options.roadLength / dashSpacing
    )

    for (
      let lane = 1;
      lane < options.laneCount;
      lane += 1
    ) {
      const x =
        -options.roadWidth / 2 +
        lane * laneWidth

      for (
        let row = 0;
        row < dashRows;
        row += 1
      ) {
        const dash = new THREE.Mesh(
          dashGeometry,
          dashMaterial
        )

        dash.position.set(
          x,
          0.045,
          -row * dashSpacing
        )

        scene.add(dash)
        laneDashes.push(dash)
      }
    }

    const carLights = []

    const yellowMaterial = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: options.yellow,
        transparent: true,
        opacity: 0.95
      })
    )

    const whiteMaterial = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: options.white,
        transparent: true,
        opacity: 0.9
      })
    )

    const lightGeometry = registerGeometry(
      new THREE.BoxGeometry(0.12, 0.12, 5)
    )

    function randomBetween(minimum, maximum) {
      return (
        Math.random() *
          (maximum - minimum) +
        minimum
      )
    }

    for (
      let index = 0;
      index < options.lightCount;
      index += 1
    ) {
      const lane = Math.floor(
        Math.random() * options.laneCount
      )

      const laneCenter =
        -options.roadWidth / 2 +
        laneWidth / 2 +
        lane * laneWidth

      const light = new THREE.Mesh(
        lightGeometry,
        index % 3 === 0
          ? whiteMaterial
          : yellowMaterial
      )

      light.position.set(
        laneCenter + randomBetween(-1.2, 1.2),
        randomBetween(0.18, 0.45),
        -randomBetween(5, options.roadLength)
      )

      light.scale.z = randomBetween(0.8, 3.5)

      light.userData.speed = randomBetween(
        options.speed * 0.6,
        options.speed * 1.4
      )

      light.userData.direction =
        index % 2 === 0 ? 1 : -1

      scene.add(light)
      carLights.push(light)
    }

    const sideSticks = []

    const stickGeometry = registerGeometry(
      new THREE.BoxGeometry(0.08, 1.8, 0.08)
    )

    const stickMaterial = registerMaterial(
      new THREE.MeshBasicMaterial({
        color: options.yellow
      })
    )

    const totalSticks = 35

    for (
      let index = 0;
      index < totalSticks;
      index += 1
    ) {
      const z =
        -(index / totalSticks) *
        options.roadLength

      const leftStick = new THREE.Mesh(
        stickGeometry,
        stickMaterial
      )

      leftStick.position.set(
        -options.roadWidth / 2 - 1.5,
        0.9,
        z
      )

      scene.add(leftStick)
      sideSticks.push(leftStick)

      const rightStick = new THREE.Mesh(
        stickGeometry,
        stickMaterial
      )

      rightStick.position.set(
        options.roadWidth / 2 + 1.5,
        0.9,
        z
      )

      scene.add(rightStick)
      sideSticks.push(rightStick)
    }

    const clock = new THREE.Clock()
    let disposed = false
    let currentSpeed = options.speed

    function animate() {
      if (disposed) {
        return
      }

      const delta = Math.min(
        clock.getDelta(),
        0.05
      )

      laneDashes.forEach(dash => {
        dash.position.z +=
          currentSpeed * delta

        if (dash.position.z > 12) {
          dash.position.z -= options.roadLength
        }
      })

      carLights.forEach(light => {
        const movement =
          light.userData.speed *
          delta *
          light.userData.direction

        light.position.z += movement

        if (
          light.userData.direction > 0 &&
          light.position.z > 15
        ) {
          light.position.z =
            -options.roadLength
        }

        if (
          light.userData.direction < 0 &&
          light.position.z <
            -options.roadLength
        ) {
          light.position.z = 12
        }
      })

      sideSticks.forEach(stick => {
        stick.position.z +=
          currentSpeed * delta

        if (stick.position.z > 15) {
          stick.position.z -=
            options.roadLength
        }
      })

      composer.render(delta)

      animationRef.current =
        window.requestAnimationFrame(animate)
    }

    function speedUp() {
      currentSpeed = options.speed * 1.8
    }

    function slowDown() {
      currentSpeed = options.speed
    }

    function handleResize() {
      const newWidth = Math.max(
        container.clientWidth,
        1
      )

      const newHeight = Math.max(
        container.clientHeight,
        1
      )

      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
      )

      renderer.setSize(
        newWidth,
        newHeight,
        false
      )

      composer.setSize(
        newWidth,
        newHeight
      )
    }

    const resizeObserver = new ResizeObserver(
      handleResize
    )

    resizeObserver.observe(container)

    window.addEventListener(
      'mousedown',
      speedUp
    )

    window.addEventListener(
      'mouseup',
      slowDown
    )

    window.addEventListener(
      'touchstart',
      speedUp,
      { passive: true }
    )

    window.addEventListener(
      'touchend',
      slowDown,
      { passive: true }
    )

    animate()

    return () => {
      disposed = true

      if (animationRef.current) {
        window.cancelAnimationFrame(
          animationRef.current
        )
      }

      resizeObserver.disconnect()

      window.removeEventListener(
        'mousedown',
        speedUp
      )

      window.removeEventListener(
        'mouseup',
        slowDown
      )

      window.removeEventListener(
        'touchstart',
        speedUp
      )

      window.removeEventListener(
        'touchend',
        slowDown
      )

      disposableGeometries.forEach(
        geometry => geometry.dispose()
      )

      disposableMaterials.forEach(
        material => material.dispose()
      )

      composer.dispose()
      renderer.dispose()
      renderer.forceContextLoss()

      scene.clear()

      if (
        renderer.domElement.parentNode ===
        container
      ) {
        container.removeChild(
          renderer.domElement
        )
      }
    }
  }, [effectOptions])

  return (
    <div
      ref={containerRef}
      className="hyperspeed-canvas-container"
      aria-hidden="true"
    />
  )
}

export default Hyperspeed
/**
 * OGL renderer for the hero. Renders only while the hero is on screen and the
 * tab is visible; pixel ratio is capped to protect weaker GPUs.
 */
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import { heroVertex, heroFragment } from './heroShaders';

export interface HeroSceneOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  color: [number, number, number];
}

export class HeroScene {
  private renderer: Renderer;
  private program: Program;
  private mesh: Mesh;
  private texture: Texture;
  private visible = true;
  private observer: IntersectionObserver;
  readonly uniforms: {
    uImage: { value: Texture };
    uResolution: { value: [number, number] };
    uImageSize: { value: [number, number] };
    uTime: { value: number };
    uPointer: { value: [number, number] };
    uLens: { value: number };
    uReveal: { value: number };
    uScroll: { value: number };
    uColor: { value: [number, number, number] };
    uPortrait: { value: number };
  };

  constructor({ canvas, image, color }: HeroSceneOptions) {
    this.renderer = new Renderer({
      canvas,
      webgl: 2,
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      powerPreference: 'high-performance',
    });
    const gl = this.renderer.gl;
    if (!(gl instanceof WebGL2RenderingContext)) throw new Error('WebGL2 unavailable');
    // CPU-emulated WebGL would make the page crawl: keep the still image instead.
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpu)) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      throw new Error(`Software WebGL renderer (${gpu})`);
    }

    this.texture = new Texture(gl, {
      generateMipmaps: true,
      minFilter: gl.LINEAR_MIPMAP_LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE,
    });
    this.texture.image = image;

    this.uniforms = {
      uImage: { value: this.texture },
      uResolution: { value: [1, 1] },
      uImageSize: { value: [image.naturalWidth || 1, image.naturalHeight || 1] },
      uTime: { value: 0 },
      uPointer: { value: [0.72, 0.45] },
      uLens: { value: 0 },
      uReveal: { value: 0 },
      uScroll: { value: 0 },
      uColor: { value: color },
      uPortrait: { value: 0 },
    };

    this.program = new Program(gl, {
      vertex: heroVertex,
      fragment: heroFragment,
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.mesh = new Mesh(gl, { geometry: new Triangle(gl), program: this.program });

    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = !!entry?.isIntersecting;
    });
    this.observer.observe(canvas);
    this.resize();
  }

  /** Lowers the render resolution (used by the frame-time governor). */
  setPixelRatio(dpr: number) {
    this.renderer.dpr = dpr;
    this.resize();
  }

  get canvas() {
    return this.renderer.gl.canvas as HTMLCanvasElement;
  }

  resize() {
    const canvas = this.renderer.gl.canvas as HTMLCanvasElement;
    // Measure the container: OGL writes an inline pixel size onto the canvas itself.
    const { width, height } = (canvas.parentElement ?? canvas).getBoundingClientRect();
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    this.uniforms.uResolution.value = [width, height];
    this.uniforms.uPortrait.value = width / height < 0.9 ? 1 : 0;
  }

  render(time: number) {
    if (!this.visible || document.hidden) return;
    this.uniforms.uTime.value = time;
    this.renderer.render({ scene: this.mesh });
  }

  destroy() {
    this.observer.disconnect();
    const gl = this.renderer.gl;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

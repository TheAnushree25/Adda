/**
 * Central GSAP setup: plugins are registered once and re-exported so every
 * module shares the same instances.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, MotionPathPlugin);

// House eases (match the CSS tokens so JS and CSS motion feel the same).
CustomEase.create('quint', 'M0,0 C0.23,1 0.32,1 1,1');
CustomEase.create('soft', 'M0,0 C0.4,0 0.2,1 1,1');

gsap.defaults({ ease: 'quint', duration: 1 });

ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };

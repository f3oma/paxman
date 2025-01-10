
import {
    style,
    animate,
    animation,
    keyframes
  } from "@angular/animations";
  
  
  // =========================
  // Fade
  // =========================
  export const fadeIn = animation([
    style({ opacity: 0 }), // start state
    animate('300ms', style({ opacity: 1 }))
  ]);
  
  export const fadeOut = animation([
    animate('300ms', style({ opacity: 0 }))
  ]);
  
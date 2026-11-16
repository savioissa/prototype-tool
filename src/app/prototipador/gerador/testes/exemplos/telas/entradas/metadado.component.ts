import { Component } from '@angular/core';

// Inputs só no metadado e hostDirectives não são lidos: viram aviso.
@Component({
  standalone: true,
  template: '',
  inputs: ['valor'],
  hostDirectives: [],
})
export class MetadadoComponent {
  valor = '';
}

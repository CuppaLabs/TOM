import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditorMdDirective} from './director/editor-md.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [EditorMdDirective],
  exports: [EditorMdDirective]
})
export class EditorMdModule {
}

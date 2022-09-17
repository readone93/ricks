import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropDirective } from './directives/dragdrop/dragdrop.directive';
import { AbbPipe } from './pipes/abbriviate/abb.pipe';
import { TrustedURLPipe } from './pipes/trustedURL/trusted-urlpipe.pipe';
import { NumberFormatPipe } from './pipes/negativeNumber/negative-number.pipe';
import { HumanizePipe } from './pipes/humanize/humanize.pipe';



@NgModule({
  declarations: [DragDropDirective, AbbPipe, TrustedURLPipe, NumberFormatPipe, HumanizePipe],
  imports: [
    CommonModule
  ],
  exports: [DragDropDirective, AbbPipe, TrustedURLPipe, NumberFormatPipe, HumanizePipe]
})
export class ServicesModule { }

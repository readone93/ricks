import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'abb'
})
export class AbbPipe implements PipeTransform {
 
  transform(value: string) {
    if ((typeof value) !== 'string') {
      return value;
    }
    const holder = value.split(" ")
    value = "";
    for (let index = 0; index < holder.length; index++) {
      if(index != 0){
        value = value + '.' + holder[index][0] 
      }else{
        value =  holder[index][0] 
      } 
    }
    return value;
  }
}

import { Component, ViewChild, Renderer, ViewEncapsulation, Input, Output, ElementRef, EventEmitter } from '@angular/core';



@Component({
    selector: 'app-live-file-reader',
    template: require('./app-live-file-reader.html'),
    styles: [`
        .app-live-picture-wrapper {
                margin-left: 20px;
                border-radius: 50%;
                 border: 1px solid #ccc;\n\
 position: relative;
           }
           .app-live-upload-btn{
               margin:0 10px;
           }
           .app-live-picture-wrapper > img{
               border-radius: 100%;
                width: 320px;
                height: 400px;
                padding: 2px;
           }
            a {
                  color:#fff;
              }
              .app-live-picture-wrapper.fr-header-image{
                  border-radius: 5px;
                 
              }
              .app-live-picture-wrapper.fr-header-image > img{
                   border-radius: 0;
                   width: 320px;
              }
              i.ion-ios-close-outline {
   position: absolute;
    top: -12px;
    right: -192px;
    font-size: xx-large;
    background: #e45c5c;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    color: white;
    font-weight: bolder;
}
    `]

})
export class AppLiveFileReader {

    @Input() defaultPicture: string = '';
    @Input() picture: string = '';
    @Input() btnText: string = 'Select';
    @Input() imageTypeHeader: boolean = false;
    @Output() complete = new EventEmitter<any>();
    @Output() delete = new EventEmitter<any>();
    @Input() canDelete: boolean = true;


    @ViewChild('fileUpload') protected _fileUpload: ElementRef;

    constructor(private renderer: Renderer) {

    }
    resultSet: any;

    changeListener($event: any) {
        var self = this;
        var file: File = $event.target.files[0];
        var myReader: FileReader = new FileReader();
        myReader.onload = function (e) {
            self.picture = myReader.result;
            self.complete.next({file: $event.target.files });
        };
        myReader.readAsDataURL(file);
    }

    bringAppLiveFileSelector() {
        this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
        return false;
    }

    public removePicture(): void {
        var yes = window.confirm("Do you really want to delete item. ");
        if (yes) {
            this.picture = '';
            this.defaultPicture = null;
            this.delete.emit(this.defaultPicture);
            this.defaultPicture = null;
            console.log('this.defaultPicture: ', this.defaultPicture)
        }
    }


}

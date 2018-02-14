import {Component, ViewChild, Renderer, ViewEncapsulation, Input, Output, ElementRef, EventEmitter} from '@angular/core';



@Component({
    selector: 'thumbnail-file-reader',
    template: require('./thumbnailFileReader.html'),
    styles: [`
        .thumbnail-picture-wrapper {
                margin-left: 20px;
               
                 border: 1px solid #ccc;\n\
 position: relative;
           }
           .thumbnail-upload-btn{
               margin:0 10px;
           }
           .thumbnail-picture-wrapper > img{
              max-width: 100%;
                width: 50px;
                padding: 2px;
           }
            a {
                  color:#fff;
              }
              .thumbnail-picture-wrapper.fr-header-image{
                  border-radius: 5px;
                 
              }
              .thumbnail-picture-wrapper.fr-header-image > img{
                   border-radius: 0;
                   width: 100px;
                   height:50px;
              }
              i.ion-ios-close-outline {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 18px;
    background: #fff;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
}
    `]

})
export class ThumbnailFileReader {

    @Input() defaultPicture: string = '';
    @Input() picture: string = '';
    @Input() btnText: string = 'Upload';
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

        myReader.onloadend = function (e) {

            self.complete.next({file: $event.target.files });
            self.picture = myReader.result;
            //   console.log('this.picture', this.picture);
        };
        myReader.addEventListener('load', (event: Event) => {
            this.picture = (<any>event.target).result;
            //   console.log('addEventListener this.picture', this.picture);
        }, false);
        myReader.readAsDataURL(file);
    }

    bringThumbFileSelector() {
        this.renderer.invokeElementMethod(this._fileUpload.nativeElement, 'click');
        return false;
    }

    public removePicture(): void {
        this.picture = '';
//        this.defaultPicture = null;
        this.delete.emit(this.defaultPicture);
//        this.defaultPicture = null;
        console.log('this.defaultPicture: ',this.defaultPicture)
    }


}

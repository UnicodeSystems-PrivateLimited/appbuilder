import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Printer, PrintOptions, ThemeableBrowser } from 'ionic-native';
import { GlobalService, DisplayService } from '../../providers';
declare var PDFJS: any;
declare var window: any;

/*
  Generated class for the PdfViewer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pdf-viewer',
  templateUrl: 'pdf-viewer.html'
})
export class PdfViewer {

  @ViewChild("container") container;

  public url: string;
  public websiteName: string;
  public isPrintingAllowed: boolean;
  public tabId: number;
  public loader: boolean = false;


  constructor(
    public navCtrl: NavController,
    private navParams: NavParams,
    public globalService: GlobalService,
    private platform: Platform,
    private display: DisplayService,
  ) {
    this.url = navParams.get('url');
    this.websiteName = navParams.get('name');
    this.tabId = navParams.get('tabId');
    this.isPrintingAllowed = navParams.get('isPrintingAllowed');

  }

  ngAfterViewInit() {
    console.log('Hello PdfViewer Page');
    this.showPdf();
  }

  public showPdf(): void {
    console.log("this.myCanvas", this.container);
    let container = this.container.nativeElement;
    let desireWidth = this.container.nativeElement.clientWidth;
    console.log("desireWidth", desireWidth);
    let scale = 1;
    this.loader = true;
    var self = this;
    PDFJS.getDocument(this.url).then(function (pdfDoc_) {
      console.log("pdfDoc_", pdfDoc_);
      for (var num = 1; num <= pdfDoc_.numPages; num++) {
        pdfDoc_.getPage(num).then(function (page) {
          var viewport = page.getViewport(scale);
          viewport = page.getViewport(desireWidth / viewport.width);
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          var renderContext = {
            canvasContext: ctx,
            viewport: viewport
          };
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          container.appendChild(canvas);
          page.render(renderContext);
        });
      }
      self.loader = false;
    });
  }
  public getFileFromUri(url): any {
    var filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    let p = new Promise((resolve, reject) => {
      xhr.onload = function () {
        var reader = new FileReader();
        reader.readAsDataURL(xhr.response);
        reader.onload = function () {
          resolve(reader.result.replace("data:application/pdf;base64,", ""));
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      };
      xhr.open('GET', url);
      xhr.send();
    });
    return p;
  };

  public printPage(): void {
    this.getFileFromUri(this.url).then((res) => {
      this.platform.ready().then(() => {
        window.plugins.PrintPDF.isPrintingAvailable(function (isAvailable) {
          console.log('printing is available: ' + isAvailable);
          if (isAvailable) {
            window.plugins.PrintPDF.print({
              data: res,
              type: 'Data',
              title: 'Print Document',
              success: function () {
                console.log('success');
              },
              error: function (data) {
                data = JSON.parse(data);
                console.log('failed: ' + data.error);
              }
            });
          }
        }, () => {
          this.display.showAlert('Printer not available.');
        });
      });
    });
  }
}

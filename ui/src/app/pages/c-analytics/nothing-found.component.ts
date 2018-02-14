import { Component } from '@angular/core';

@Component({
    selector: 'nothing-found',
    template: `<div class="layout-column text-center no-data-found layout-align-start-center white-bg">
                    <h2>Nothing to see here !</h2>
                    <span>Looks like you need some user interaction, head over to the promote section and print out your App's QR Code to get some more users.</span>
                </div>`
})
export class NothingFound {

}
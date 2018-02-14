import { Component, ViewEncapsulation, OnInit, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, SelectItem, RadioButton } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { AppsTab, ContactLocation, distanceTypeMile, distanceTypeKilometer, OpeningTime, ContactComment } from '../../../../../theme/interfaces';
import { ContactUsService } from './contact-us.service';
import { LocationEditor, MobileViewComponent } from '../../../../../components';

@Component({
    selector: 'tab-function-contact-us',
    pipes: [],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, Dialog, DROPDOWN_DIRECTIVES, MobileViewComponent, TAB_DIRECTIVES, Dragula, LocationEditor, RadioButton],
    encapsulation: ViewEncapsulation.None,
    template: require('./contact-us.component.html'),
    styles: [require('./contact-us.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, ContactUsService]
})

export class ContactUs implements OnInit {
    public tabId: number;
    public ready: boolean = false;
    public locations: ContactLocation[] = [];
    public deleteLocationId: number = null;
    public locationData: ContactLocation = new ContactLocation();
    public tabData: AppsTab = new AppsTab();
    public leftImageTarget: any = null;
    public rightImageTarget: any = null;
    public isMapDataSet: boolean = false;
    public activeLocationId: number = null;
    public addLocationCopy: ContactLocation = null;
    public leftImage: string | File;
    public rightImage: string | File;
    public openingTimes: OpeningTime[];
    public openingTime: OpeningTime = new OpeningTime();
    public openingTimeFormHeader: string;
    public comments: ContactComment[] = [];
    public staticDataService: typeof GridDataService = GridDataService;

    private LOCATIONS_BAG: string = 'contact-locations-bag';
    private OPENING_TIMES_BAG: string = 'contact-opening-times-bag';
    private DISTANCE_TYPE_MILE: number = distanceTypeMile;
    private DISTANCE_TYPE_KILOMETER: number = distanceTypeKilometer;

    // ------------------- DISPLAY CONTROL ----------------------------
    public showLoader: boolean = false;
    public locationEditorDisplay: boolean = false;
    public addItemDisplay: boolean = false;
    //    public locationDeleteDialogDisplay: boolean = false;
    public openingTimesDialogDisplay: boolean = false;
    public openingTimeFormDisplay: boolean = false;
    public addSaveButtonHide: boolean = false;

    // ----------------------------------------------------------------

    constructor(
        private pageService: PageService,
        private params: RouteParams,
        private service: ContactUsService,
        private dragulaService: DragulaService,
        private dataService: GridDataService
    ) {
        this.tabId = parseInt(params.get('tabId'));
        this.locationData.tab_id = this.tabId;

        dragulaService.dropModel.subscribe((value) => {
            switch (value[0]) {
                case this.LOCATIONS_BAG:
                    this.sortLocations();
                    break;
                case this.OPENING_TIMES_BAG:
                    this.sortOpeningTimes();
                    break;
            }
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public getInitData(): void {
        this.service.getInitData(this.tabId).subscribe(res => {
            if (res.success) {
                this.locations = res.data.location_list;
                this.tabData = res.data.tabData;
                if (res.data.item_data !== undefined && res.data.item_data) {
                    this.locationData = res.data.item_data;
                }
                if (res.data.comments !== undefined && res.data.comments) {
                    this.comments = res.data.comments;
                }
                if (this.locations.length > 0) {
                    this.activeLocationId = this.locationData.id;
                    this._setDisplayImages(this.locationData.left_image, this.locationData.right_image);
                } else {
                    this.showAddItem();
                }
                this.ready = true;
                console.log("this.locationData", this.locationData);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showLocationEditor(): void {
        this.locationEditorDisplay = true;
        this.isMapDataSet = true;
    }

    public onLatLongChange(event: any): void {
        this.locationData.m_lat = event.lat;
        this.locationData.m_long = event.long;
    }

    public getAllDistanceOptions(): SelectItem[] {
        return [
            { label: 'Mile', value: distanceTypeMile },
            { label: 'Kilometer', value: distanceTypeKilometer },
        ];
    }

    public onLeftImageChange(event: any): void {
        this.locationData.left_image = event.target.files[0];
        this.leftImageTarget = event.target;
    }

    public onRightImageChange(event: any): void {
        this.locationData.right_image = event.target.files[0];
        this.rightImageTarget = event.target;
    }

    public onLocationFormSubmit(): void {
        PageService.showLoader();
        this.addSaveButtonHide = true;
        this.locationData.is_left_right_image_enabled = this.locationData.is_left_right_image_enabled ? 1 : 0;
        this.service.saveLocation(this.locationData, this.isMapDataSet).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.pageService.showSuccess("Location saved succesfully.");
                this.addLocationCopy = null;
                this.addItemDisplay = false;
                this._clearImageInputs();
                // Send true to tell getLocationList() that a location has just been added.
                // So it needs to make the last added location active.
                this.getLocationList(this.activeLocationId === -1 ? true : false);
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
        });
    }

    public sortLocations(): void {
        let ids: number[] = [];
        for (let location of this.locations) {
            ids.push(location.id);
        }
        this.service.sortLocationList(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Location order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showAddItem(): void {
        if (this.activeLocationId === -1) {
            return;
        }
        this._clearImageInputs();
        this._setDisplayImages(null, null);
        this.addItemDisplay = true;
        this.locationData = new ContactLocation();
        this.locationData.tab_id = this.tabId;
        this.locationEditorDisplay = false;
        // -1 for the new item which doesn't yet have any ID.
        this.activeLocationId = -1;
        this.isMapDataSet = false;
    }

    public removeAddItem(): void {
        if (this.locations.length === 0) {
            // If there are no locations, then the add location item box should always be visible
            // and active.
            return;
        }
        this.addItemDisplay = false;
        if (this.activeLocationId === -1) {
            this._makeFirstLocationActive();
        }
    }

    public onLocationItemClick(locationId: number): void {
        if (this.activeLocationId === locationId) {
            return;
        } else if (this.activeLocationId === -1) {
            // If the currently active item is the new item, then make a copy of its data so that it can
            // be populated again later
            this.addLocationCopy = this.locationData;
        }
        this._clearImageInputs();
        this.activeLocationId = locationId;
        this.locationEditorDisplay = false;
        this.isMapDataSet = false;
        this.getLocation();
    }

    public getLocationList(recentlyAdded: boolean = false): void {
        this.service.getLocationList(this.tabId).subscribe(res => {
            if (res.success) {
                this.locations = res.data;
                if (recentlyAdded) {
                    this.activeLocationId = this.locations[this.locations.length - 1].id;
                }
                this.getLocation();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getLocation(): void {
        PageService.showLoader();
        this.service.getLocationData(this.activeLocationId).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.locationData = res.data.locationData;
                this.comments = res.data.comments;
                this._setDisplayImages(this.locationData.left_image, this.locationData.right_image);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public showLocationDeleteDialog(event: any, locationId: number): void {
        event.stopPropagation();
        this.deleteLocationId = locationId;
        //        this.locationDeleteDialogDisplay = true;
        var yes = window.confirm("Are you sure you want to delete the selected location ? ");
        if (yes) {
            this.onLocationDeleteClick();
        }
    }

    public onLocationDeleteClick(): void {
        this.showLoader = true;
        this.service.deleteLocation([this.deleteLocationId]).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                //                this.locationDeleteDialogDisplay = false;
                this.pageService.showSuccess(res.message);
                this.dataService.getByID(this.locations, this.deleteLocationId, (data, index) => {
                    this.locations.splice(index, 1);
                });
                if (this.locations.length > 0 && this.activeLocationId === this.deleteLocationId) {
                    this._makeFirstLocationActive();
                } else {
                    this.showAddItem();
                }
            } else {
                this.pageService.showError(res.message);
            }
        })
    }

    private _makeFirstLocationActive(): void {
        this.onLocationItemClick(this.locations[0].id);
    }

    public onNewItemClick(): void {
        if (this.activeLocationId === -1) {
            return;
        }
        this.addItemDisplay = true;
        this._clearImageInputs();
        this._setDisplayImages(null, null);
        if (this.addLocationCopy) {
            this.locationData = this.addLocationCopy;
        } else {
            this.locationData = new ContactLocation();
            this.locationData.tab_id = this.tabId;
        }
        this.locationEditorDisplay = false;
        this.isMapDataSet = false;
        // -1 for the new item which doesn't yet have any ID.
        this.activeLocationId = -1;
    }

    private _clearImageInputs(): void {
        if (this.leftImageTarget) {
            this.leftImageTarget.value = null;
        }
        if (this.rightImageTarget) {
            this.rightImageTarget.value = null;
        }
    }

    public deleteLeftImage(locationId: number): void {
        if (confirm("Are you sure you want to delete this image ?")) {
            PageService.showLoader();
            this.service.deleteImage('left', locationId).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.pageService.showSuccess('Left image successfully deleted.');
                    this.locationData.left_image = null;
                    this.leftImage = null;
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

    public deleteRightImage(locationId: number): void {
        if (confirm("Are you sure you want to delete this image ?")) {
            PageService.showLoader();
            this.service.deleteImage('right', locationId).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.pageService.showSuccess('Right image successfully deleted.');
                    this.locationData.right_image = null;
                    this.rightImage = null;
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

    private _setDisplayImages(leftImage: string | File, rightImage: string | File): void {
        this.leftImage = leftImage;
        this.rightImage = rightImage;
    }

    public onSetOpeningTimesClick(): void {
        if (this.activeLocationId === -1) {
            return;
        }
        PageService.showLoader();
        this.getOpeningTimes();
    }

    public getOpeningTimes(): void {
        this.service.getOpeningTimesList(this.activeLocationId).subscribe(res => {
            PageService.hideLoader(); // Wouldn't matter if the loader was not shown in the first place.
            if (res.success) {
                this.openingTimes = res.data;
                this.openingTimesDialogDisplay = true; // Wouldn't matter if the dialog was already shown in the first place.
                this.pageService.onDialogOpen();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortOpeningTimes(): void {
        let ids: number[] = [];
        for (let openingTime of this.openingTimes) {
            ids.push(openingTime.id);
        }
        this.service.sortOpeningTimes(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess('Opening Times order saved.');
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onOpeningTimeDeleteClick(id: number): void {
        if (confirm("Are you sure you want to delete this opening time ?")) {
            PageService.showLoader();
            this.service.deleteOpeningTime([id]).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.pageService.showSuccess(res.message);
                    this.dataService.getByID(this.openingTimes, id, (data, index) => {
                        this.openingTimes.splice(index, 1);
                    });
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

    public onAddOpeningTimeClick(): void {
        this.openingTimeFormHeader = "Add Opening Time";
        this.openingTime = new OpeningTime();
        this.openingTime.contact_id = this.activeLocationId;
        this.openingTimeFormDisplay = true;
        this.pageService.onDialogOpen();
    }

    public onOpeningTimeEditClick(id: number): void {
        this.showLoader = true;
        this.service.getOpeningTimeData(id).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.openingTime = res.data;
                this.openingTimeFormHeader = "Edit Opening Time";
                this.openingTimeFormDisplay = true;
                this.pageService.onDialogOpen();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onOpeningTimeFormSubmit(): void {
        this.showLoader = true;
        this.service.saveOpeningTime(this.openingTime).subscribe(res => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess("Opening Time saved succesfully.");
                this.openingTimeFormDisplay = false;
                this.getOpeningTimes();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCommentDeleteClick(id: number): void {
        if (confirm("Are you sure you want to delete this comment ?")) {
            PageService.showLoader();
            this.service.deleteComment([id]).subscribe(res => {
                PageService.hideLoader();
                if (res.success) {
                    this.pageService.showSuccess("Comment successfully deleted.");
                    this.dataService.getByID(this.comments, id, (data, index) => {
                        this.comments.splice(index, 1);
                    });
                } else {
                    this.pageService.showError(res.message);
                }
            });
        }
    }

    public onAddressChange(address: string): void {
        let addressSplit: string[] = address.split(",");
        this.locationData.address_sec_1 = addressSplit[0];
        addressSplit.splice(0, 1);
        this.locationData.address_sec_2 = addressSplit.join();
    }
}
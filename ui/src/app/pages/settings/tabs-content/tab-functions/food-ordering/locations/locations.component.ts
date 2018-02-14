import { Component, ViewEncapsulation, Input, NgZone, OnInit } from '@angular/core';
import { PageService, GridDataService } from '../../../../../../theme/services';
import { FoodOrderingService } from '../food-ordering.service';
import { SelectItem, Dropdown, Dialog } from "primeng/primeng";
import { FoodLocationInfo, FoodOrderingLocationsHours, FoodOrderingLocationsHoursTimings } from "../../../../../../theme/interfaces/common-interfaces";
import { AppConfigSetting } from '../../../../../../theme/interfaces';
import { TOOLTIP_DIRECTIVES } from "ng2-bootstrap";
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { LocationEditor } from '../../../../../../components';

@Component({
    selector: 'food-ordering-locations',
    encapsulation: ViewEncapsulation.None,
    template: require('./locations.component.html'),
    viewProviders: [DragulaService],
    providers: [PageService],
    directives: [Dropdown, Dialog, TOOLTIP_DIRECTIVES, Dragula, LocationEditor]
})

export class Locations implements OnInit {

    @Input() contactList: Array<any> = [];
    @Input() timeZoneList: Array<any> = [];
    @Input() foodlocationInfoData: Array<any> = [];

    public timezoneSelect = [];
    public defaultTimezone: string;
    public checkAllToggle: boolean = false;
    public appConfigSetting: AppConfigSetting = new AppConfigSetting();
    public showAddLocationDialog: boolean = false;
    public LocationFormHeader: string;
    public selectedFoodLocations: boolean[] = [];
    public foodlocationInfo: FoodLocationInfo = new FoodLocationInfo();
    public item: FoodLocationInfo;
    public contactSelect = [];
    public settings = this.service.settings;
    public addFormlocationEditorDisplay: boolean = false;
    public distanceOptions = [];
    public foodLocationHours: Array<FoodOrderingLocationsHours> = [];
    public startTimeHour = [];
    public startTimeMin = [];
    public activeItem: number;


    constructor(private pageService: PageService,
        private service: FoodOrderingService,
        private dataService: GridDataService,
        private zone: NgZone) {
        this.distanceOptions = [
            { label: 'Kilometer', value: '1' },
            { label: 'Mile', value: '2' }
        ];
        for (let j = 1; j <= 23; j++) {
            let temp;
            if (j < 10) {
                temp = j;
                temp = '0' + temp;
            } else {
                temp = j;
            }
            this.startTimeHour.push({ label: temp, value: temp });
        }
        for (let k = 0; k <= 59; k++) {
            let temp;
            if (k < 10) {
                temp = k;
                temp = '0' + temp;
            } else {
                temp = k;
            }
            this.startTimeMin.push({ label: temp, value: temp });
        }
    }

    public pushTimings(index: number): void {
        this.foodLocationHours[index].timings.push({ id: null, start_time_hour: '01', start_time_minute: '00', end_time_hour: '01', end_time_minute: '00', option: 1 });
    }

    public spliceTimings(parentIndex: number, childIndex: number): void {
        this.foodLocationHours[parentIndex].timings.splice(childIndex, 1);
    }

    public ngOnInit(): void {
        let tim = new Date().toString();
        let ctime = tim.split(" ");
        this.defaultTimezone = ctime[5];
        let myZone = this.defaultTimezone.split("");
        let newZone = myZone[0] + myZone[1] + myZone[2] + myZone[3] + myZone[4] + myZone[5] + ':' + myZone[6] + myZone[7];
        let count = 0;
        for (let item of this.timeZoneList) {
            this.timezoneSelect.push({ label: item.name, value: item.id })
        }
        this.contactSelect.push({ label: '--Select Address--' });
        for (let item of this.contactList) {
            this.contactSelect.push({ label: item.address_sec_1 + item.address_sec_2, value: item.id })
        }
    }

    public showLocationDialog(): void {
        this.LocationFormHeader = "Add New Location";
        this.foodlocationInfo = new FoodLocationInfo();
        this.foodlocationInfo.distance_type = 1;
        this.foodlocationInfo.emails = '';
        this.foodLocationHours = [];
        this.foodLocationHours = [
            { id: null, location_id: null, day: 'Monday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00', option: 0 }] },
            { id: null, location_id: null, day: 'Tuesday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00', option: 0 }] },
            { id: null, location_id: null, day: 'Wednesday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00', option: 0 }] },
            { id: null, location_id: null, day: 'Thursday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00', option: 0 }] },
            { id: null, location_id: null, day: 'Friday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00', option: 0 }] },
            { id: null, location_id: null, day: 'Saturday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00', option: 0 }] },
            { id: null, location_id: null, day: 'Sunday', status: true, timings: [{ id: null, start_time_hour: '07', start_time_minute: '00', end_time_hour: '17', end_time_minute: '00', option: 0 }] }
        ];
        this.addFormlocationEditorDisplay = false;
        this.showAddLocationDialog = true;
        this.pageService.onDialogOpen();
    }

    public onUpdateSettingsClick(): void {
        this.service.saveSettings(this.service.settings, this.service.tabID).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onLocationClick(id: number): void {
        this.addFormlocationEditorDisplay = false;
        this.service.getSingleFoodContactData(id).subscribe((res) => {
            if (res.success) {
                this.foodlocationInfo.address_section_1 = res.data.contactList.address_sec_1;
                this.foodlocationInfo.address_section_2 = res.data.contactList.address_sec_2;
                this.foodlocationInfo.latitude = res.data.contactList.m_lat;
                this.foodlocationInfo.longitude = res.data.contactList.m_long;
            }
        });
    }

    public showLocationEditor(): void {
        this.addFormlocationEditorDisplay = true;
    }

    public onLatLongChange(event: any): void {
        if (this.foodlocationInfo.latitude) {
            this.foodlocationInfo.latitude = null
        }
        if (this.foodlocationInfo.longitude) {
            this.foodlocationInfo.longitude = null
        }
        this.foodlocationInfo.latitude = event.lat;
        this.foodlocationInfo.longitude = event.long;
    }

    public getLocationInfo(): void {
        PageService.showLoader();
        this.service.getLocationInfoData(this.service.tabID).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.foodlocationInfoData = [];
                this.foodlocationInfoData = res.data.foodLocationData;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public saveLocationInfo(): void {
        this.foodlocationInfo.tab_id = this.service.tabID;
        let foodData = {
            foodlocationInfo: this.foodlocationInfo,
            foodLocationHours: this.foodLocationHours
        }
        this.service.saveLocationInfo(foodData).subscribe(res => {
            if (res.success) {
                this.foodlocationInfo = new FoodLocationInfo();
                this.pageService.showSuccess(res.message);
                this.showAddLocationDialog = false;
                this.getLocationInfo();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onItemDivClick(id: number): void {
        this.activeItem = id;
    }

    public onSelectAllCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.selectedFoodLocations = this.pageService.toggleAllCheckboxes(this.checkAllToggle, this.foodlocationInfoData);
            });
        });
    }

    public onLocationCheck(): void {
        setTimeout(() => {
            this.zone.run(() => {
                this.checkAllToggle = this.pageService.updateCheckAllToggle(this.selectedFoodLocations, this.foodlocationInfoData);
            });
        });
    }

    public onFoodLocationDeleteClick(): void {
        if (
            this.selectedFoodLocations.length > 0
            && this.selectedFoodLocations.indexOf(true) !== -1
            && confirm("Do you really want to delete the selected items? ")
        ) {
            this.deleteFoodLocation();
        }
    }

    private deleteFoodLocation(): void {
        PageService.showLoader();
        let ids: any[] = [];
        for (let i in this.selectedFoodLocations) {
            if (this.selectedFoodLocations[i]) {
                ids.push(i);
            }
        }
        this.service.deleteFoodLocation(ids).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.selectedFoodLocations = [];
                for (let i = 0; i < ids.length; i++) {
                    this.dataService.getByID(this.foodlocationInfoData, ids[i], (data, index) => {
                        this.foodlocationInfoData.splice(index, 1);
                    });
                }
                this.pageService.showSuccess(res.message);
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onAddressChange(address: string): void {
        let addressSplit: string[] = address.split(",");
        this.foodlocationInfo.address_section_1 = addressSplit[0];
        addressSplit.splice(0, 1);
        this.foodlocationInfo.address_section_2 = addressSplit.join();
    }

    public onEditCategoryClick(item: FoodLocationInfo): void {
        this.LocationFormHeader = "Edit Location";
        this.foodlocationInfo = Object.assign({}, item);
        this.addFormlocationEditorDisplay = false;
        PageService.showLoader();
        this.foodLocationHours = [];
        this.service.getLocationHoursData(this.foodlocationInfo['id']).subscribe(res => {
            PageService.hideLoader();
            if (res.success) {
                this.foodLocationHours = res.data.foodLocationHours;
                this.showAddLocationDialog = true;
                this.pageService.onDialogOpen();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

}
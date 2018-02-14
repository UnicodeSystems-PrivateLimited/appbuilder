import { Component, ViewEncapsulation, HostListener } from '@angular/core';
import { DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, TOOLTIP_DIRECTIVES, TimepickerComponent } from 'ng2-bootstrap/ng2-bootstrap';
import { Dialog, Dropdown, RadioButton, Calendar, Lightbox, MultiSelect, SelectItem } from 'primeng/primeng';
import { PageService, GridDataService } from '../../../../../theme/services';
import { RouteParams } from '@angular/router-deprecated';
import { Dragula, DragulaService } from 'ng2-dragula/ng2-dragula';
import { EventsTabService } from './events-tab.service';
import { Tab, EventsComment, ImageList, EventsGoings, RecurringEvents, EventsList, ContactLocation, TimeZone, distanceTypeKilometer, distanceTypeMile, Comment, Settings, sort_by_manual, sort_by_time } from '../../../../../theme/interfaces';
import { ColorPickerDirective } from "../../../../../color-picker/color-picker.directive";
// import { CKEditor } from 'ng2-ckeditor';
import { LocationEditor } from '../../../../../components';
import { ThumbnailFileReader, MobileViewComponent } from '../../../../../components';
import { DateTimePipe } from '../../../../../pipes/date-time.pipe';
import { DatePipe } from '../../../../../pipes/date-format.pipe';
import { TimePipe } from '../../../../../pipes/time-format.pipe';
var moment = require('moment/moment');
declare var $: any;


@Component({
    selector: 'tab-function-events',
    pipes: [DateTimePipe, DatePipe, TimePipe],
    directives: [TOOLTIP_DIRECTIVES, Dropdown, RadioButton, Lightbox, Calendar, MultiSelect, TimepickerComponent, Dialog, LocationEditor, MobileViewComponent, ThumbnailFileReader, DROPDOWN_DIRECTIVES, TAB_DIRECTIVES, ColorPickerDirective, Dragula],
    encapsulation: ViewEncapsulation.None,
    template: require('./events-tab.component.html'),
    styles: [require('./events-tab.scss')],
    viewProviders: [DragulaService],
    providers: [PageService, EventsTabService, GridDataService]
})

export class EventsTab {

    public tabId: number;
    public id: number;
    /**SINGLE EVENT */
    public deleteCommentId: number = null;
    public deleteGoingId: number = null;
    date1: Date;
    public SelectItem = [];
    public SelectedImage = [];
    public selectedItem: boolean[] = [];
    private EVENT_STATUS_ENABLED = 1;
    private EVENT_STATUS_DISABLED = 2;
    public phoneHeaderImageTarget: any = null;
    public tabletHeaderImageTarget: any = null;
    public eventImageTarget: any = null;
    public settings: Settings = new Settings();
    private SORT_BY_DATETIME: number = sort_by_time;
    private SORT_BY_MANUAL: number = sort_by_manual;
    public eventsList: EventsList[] = [];
    public singleEventData: EventsList = new EventsList();
    public imageData: ImageList = new ImageList();
    public imageList: ImageList[] = [];
    public comments: EventsComment[] = [];
    public goings: EventsGoings[] = [];
    public event_start_time: Date = new Date();
    public event_start_date: Date = new Date();
    public event_end_time: Date = new Date();
    public event_end_date: Date = new Date();
    public timezone: TimeZone[] = [];
    public contactList: ContactLocation[] = [];
    private IMAGES_BAG: string = 'images-bag';
    private EVENTS_BAG: string = 'events-bag';
    private RECURRING_EVENTS: string = 'recurring-events-bag';
    public currentDate: Date = new Date();
    public checkTrue: boolean = false;
    public checkItemTrue: boolean = false;

    /**END SINGLE EVENT */
    public tabData: Tab = {
        title: '',
        tab_func_name: ''
    };
    /**RECURRING EVENTS */
    public recurringEventList: RecurringEvents[] = [];
    public recurringEventData: RecurringEvents = new RecurringEvents();

    // ------------------- DISPLAY CONTROL ----------------------------
    /**SINGLE EVENT */
    public ready: boolean = false;
    public sortBy: number = 2;
    public checkAll: boolean = false;
    public showEditor: string = null;
    public dialogDisplay: boolean = false;
    public commentsTab: boolean = false;
    public imagesTab: boolean = false;
    public goingTab: boolean = false;
    public showLoader: boolean = false;
    public showDeleteCommentDialog: boolean = false;
    public showDeleteGoingDialog: boolean = false;
    public show: number = 2;
    public addFormlocationEditorDisplay: boolean = false;
    public recAddFormlocationEditorDisplay: boolean = false;
    public imageShow: boolean = false;
    public tabwrap: boolean = false;
    public defaultTimezone: string;
    public eventHeader: string;
    public timezoneSelect = [];
    public contactSelect = [];
    public weeks = [];
    public addSaveButtonHide: boolean = false;

    /**RECURRING EVENTS */
    public repeat = [];
    public meredian = [];
    days: SelectItem[];
    public startTimeHour = [];
    public startTimeMin = [];
    public startTimeSelect = [];
    public selectedRecurringItem: boolean[] = [];
    public recurringEventDialogDisplay: boolean = false;
    public listEventItemDialogDisplay: boolean = false;
    public checkAllRecurring: boolean = false;
    // public rec_start_time: Date;
    public start_time: Date;
    public end_time: Date;
    public start_time_hour: string = '1';
    public start_time_min: string = '0';

    public recur_end_date: Date = new Date(new Date().getFullYear(), 11, 31);
    public duration_hour: string = null;
    public duration_min: string = '0';
    public repeat_date: Date = new Date();
    // public ckEditorConfig: any = {
    //     uiColor: '#F0F3F4',
    //     height: '600',
    //     filebrowserUploadUrl: '/api/ws/function/ck-editor-image/uploadCkeditorImage',
    // };
    public customerSavedZone: number = null;
    public event_meredian: number = 1;

    /** END RECURRING EVENTS */

    /**Import events */
    public importEventsDialogDisplay: boolean = false;
    public editorView: any = null;
    public editorDiv: any = null;

    //-----------------------------------------------------

    public single_start_time_hour: number = 1;
    public single_start_time_min: number = 0;
    public single_end_time_hour: number = 1;
    public single_end_time_min: number = 0;

    public single_event_start_meredian: number = 1;
    public single_event_end_meredian: number = 1;

    constructor(private pageService: PageService,
        private params: RouteParams,
        private service: EventsTabService,
        private dragulaService: DragulaService,
        private dataService: GridDataService) {
        this.tabId = parseInt(params.get('tabId'));
        this.id = parseInt(params.get('ids'));

        for (let i = 1; i <= 20; i++) {
            this.weeks.push({ label: i, value: i });
        }
        for (let j = 1; j <= 12; j++) {
            this.startTimeHour.push({ label: j, value: j });
        }
        for (let k = 0; k <= 55; k += 5) {
            this.startTimeMin.push({ label: k, value: k });
        }

        this.repeat.push({ label: 'Weekly', value: "1" });
        this.repeat.push({ label: 'Monthly', value: "2" });
        this.meredian.push({ label: 'AM', value: 1 },
            { label: 'PM', value: 2 });

        this.days = [];
        this.days.push({ label: 'Sunday', value: 'Sunday' });
        this.days.push({ label: 'Monday', value: 'Monday' });
        this.days.push({ label: 'Tuesday', value: 'Tuesday' });
        this.days.push({ label: 'Wednesday', value: 'Wednesday' });
        this.days.push({ label: 'Thursday', value: 'Thursday' });
        this.days.push({ label: 'Friday', value: 'Friday' });
        this.days.push({ label: 'Saturday', value: 'Saturday' });

        /******************************START OF SINGLE EVENT***************************************/

        dragulaService.dropModel.subscribe((value) => {
            switch (value[0]) {
                case this.EVENTS_BAG:
                    this.sortEvents()
                    break;
                case this.IMAGES_BAG:
                    this.sortImages();
                    break;
                case this.RECURRING_EVENTS:
                    this.sortRecurringEvents();
                    break;
            }
        });
    }

    public ngOnInit(): void {
        this.getInitData();
    }

    public onImportedLocationClick(): void {
        this.show = !this.singleEventData.imported_location ? 1 : 2;
        if (this.singleEventData.imported_location === true) {
            this.addFormlocationEditorDisplay = false;
            this.singleEventData.address_sec_1 = null;
            this.singleEventData.address_sec_2 = null;
            this.singleEventData.m_lat = null;
            this.singleEventData.m_long = null;
            this.singleEventData.location_id = null;
        }
    }

    public getInitData(): void {
        // One request to get all initial data.
        this.service.getInitData(this.tabId, this.settings.sort_by).subscribe(res => {
            if (res.success) {
                this.tabData = res.data.tabData;

                if (res.data.tabData.settings) {
                    this.settings = JSON.parse(res.data.tabData.settings);
                }
                if (res.data.timezoneList) {
                    this.timezone = res.data.timezoneList;
                }
                if (res.data.contactList) {
                    this.contactList = res.data.contactList;
                }
                if (res.data.recurringEventList) {
                    this.recurringEventList = res.data.recurringEventList;
                }
                if (res.data.timeSettings) {
                    this.customerSavedZone = res.data.timeSettings.time_zone;
                }
                this.getEventsList();
                this.ready = true;
                let tim = new Date().toString();
                let ctime = tim.split(" ");
                this.defaultTimezone = ctime[5];
                let myZone = this.defaultTimezone.split("");
                let newZone = myZone[0] + myZone[1] + myZone[2] + myZone[3] + myZone[4] + myZone[5] + ':' + myZone[6] + myZone[7];
                let count = 0;
                for (let item of res.data.timezoneList) {
                    this.timezoneSelect.push({ label: item.name, value: item.id });
                    if (this.customerSavedZone) {
                        this.singleEventData.timezone_id = this.customerSavedZone;
                        this.recurringEventData.timezone_id = this.customerSavedZone;
                    } else {
                        if (newZone === item.offset_name) {
                            count++;
                            if (count == 1) {
                                this.singleEventData.timezone_id = item.id;
                                this.recurringEventData.timezone_id = item.id;
                            }
                        }
                    }
                }
                this.contactSelect.push({ label: '--Select Address--' });
                for (let item of res.data.contactList) {
                    this.contactSelect.push({ label: item.address_sec_1 + item.address_sec_2, value: item.id })
                }

            } else {
                console.log('no data found');
            }
        });
    }

    public showLocationEditor(): void {
        this.addFormlocationEditorDisplay = true;
    }

    public showRecurringLocationEditor(): void {
        this.recAddFormlocationEditorDisplay = true;
    }

    public onLatLongChange(event: any): void {
        if (this.singleEventData.m_lat) {
            this.singleEventData.m_lat = null
        }
        if (this.singleEventData.m_long) {
            this.singleEventData.m_long = null
        }
        this.singleEventData.m_lat = event.lat;
        this.singleEventData.m_long = event.long;
    }

    public showDialog() {
        this.showEditor = "single";
        this.tabwrap = true;
        this.dialogDisplay = true;
        this.pageService.onDialogOpen();
        this.event_start_date = moment(this.event_start_date).format('MM/DD/YYYY');
        this.event_end_date = moment(this.event_end_date).format('MM/DD/YYYY');
        this.imageShow = true;
        // this.showEditor = true;
        this.commentsTab = false;
        this.imagesTab = false;
        this.goingTab = false;
        this.eventHeader = 'ADD SINGLE EVENT';
        this.initEditor('single');
        this._clearImageInputs();
        this.refreshSingleEventData();
    }

    public showEditDialog(id: number): void {
        this.showEditor = "single";
        this.tabwrap = false;
        this.dialogDisplay = true;
        this.pageService.onDialogOpen();
        this.commentsTab = true;
        // this.showEditor = true;
        this.imagesTab = true;
        this.eventHeader = 'EDIT SINGLE EVENT';

        this.goingTab = true;
        this.service.getSingleEventData(id).subscribe((res) => {
            if (res.success) {
                this.singleEventData = res.data.eventData;
                if (res.data.eventData) {
                    this.event_start_date = res.data.eventData.event_start_date;
                    this.event_start_date = moment(this.event_start_date).format('MM/DD/YYYY');
                    let startTime = moment(res.data.eventData.event_start_time).format();
                    this.start_time = new Date(startTime);
                    this.singleEventData.phone_header_image_url = res.data.eventData.phone_header_image;
                    this.event_end_date = res.data.eventData.event_end_date;
                    this.event_end_date = moment(this.event_end_date).format('MM/DD/YYYY');
                    let endTime = moment(res.data.eventData.event_end_time).format();
                    this.end_time = new Date(endTime);

                    this.setSingleEventStartAndEndTimes(this.start_time, this.end_time);

                    this.singleEventData.is_header_required = this.singleEventData.is_header_required == 1 ? true : false;
                    // if (res.data.eventData.event_start_time_hour) {
                    //     this.single_start_time_hour = res.data.eventData.event_start_time_hour;
                    // }
                    // if (res.data.eventData.event_start_time_min) {
                    //     this.single_start_time_min = res.data.eventData.event_start_time_min;
                    // }
                    // if (res.data.eventData.event_end_time_hour) {
                    //     this.single_end_time_hour = res.data.eventData.event_end_time_hour;
                    // }
                    // if (res.data.eventData.event_end_time_min) {
                    //     this.single_end_time_min = res.data.eventData.event_end_time_min;
                    // }
                    this.initEditor('single');
                    if (res.data.eventData.imported_location) {
                        this.show = 1;

                    }
                }
                this.timezone = res.data.timezone;
                this.comments = res.data.comments;
                this.goings = res.data.goings;
                this.contactList = res.data.contactList;
                this.imageList = res.data.images;
                //**********************************************for lightbox***************************//
                // this.imageList.forEach(element => {
                //     var eventImage = {};
                //     for (var key in element) {
                //         if (element.hasOwnProperty(key)) {

                //             if (key == 'image') {
                //                 eventImage['source'] = element[key];

                //             }
                //             if (key == 'caption') {
                //                 eventImage['title'] = element[key];

                //             }

                //              if (key == 'image') {
                //                 eventImage['thumbnail'] = element[key];

                //             }
                //        }

                //     } 
                //     this.SelectedImage.push(eventImage);


                // });
                //  console.log('this.SelectedImage');
                //  console.log(this.SelectedImage);
                //**********************************************************************************//

                this.singleEventData.id = res.data.eventData.id;
                this.singleEventData.status = (res.data.eventData.status == 1) ? true : false;
                this.singleEventData.imported_location = !!this.singleEventData.imported_location;
                this.showLoader = false;
                this.imageShow = true;
            }
        });
    }



    public onDialogHide(): void {
        this._clearImageInputs();
        this.editorView = null;
        this.editorDiv = null;
        this.singleEventData.phone_header_image = null;
        this.singleEventData.tablet_header_image = null;
        this.imageShow = false;
        this.imagesTab = false;
        this.goingTab = false;
        this.commentsTab = false;
        this.show = 2;
        this.event_end_date = new Date();
        // this.single_start_time_min = '0';
        // this.single_start_time_hour = '0';
        // this.single_end_time_hour = '0';
        // this.single_end_time_min = '0';
        this.start_time = new Date();
        this.end_time = new Date();
        this.event_start_date = new Date();
        this.refreshSingleEventData();
        this.addFormlocationEditorDisplay = false;

    }



    public onPhoneHeaderImageChange(event: any): void {
        this.phoneHeaderImageTarget = event.target;
        this.singleEventData.phone_header_image = event.file[0];
    }

    public onTabletHeaderImageChange(event: any): void {
        this.tabletHeaderImageTarget = event.target;
        this.singleEventData.tablet_header_image = event.file[0];
    }

    public saveSettings(): void {
        this.showLoader = true;
        this.service.saveSettings(this.settings, this.tabId).subscribe((res) => {
            this.showLoader = false;
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.getEventsList();
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onSaveSingleEvent(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        if (this.editorView) {
            this.singleEventData.description = this.editorView.html();
        }
        this.singleEventData.tab_id = this.tabId;

        // Converting 12 hour time to 24 hour format
        let mstarttime: string = this.convertTo24HourFormat(this.single_start_time_hour, this.single_start_time_min, this.single_event_start_meredian);
        let mendtime: string = this.convertTo24HourFormat(this.single_end_time_hour, this.single_end_time_min, this.single_event_end_meredian);

        // var mstarttime = this.single_start_time_hour + ':' + this.single_start_time_min;
        // var mstarttime = moment(this.start_time).format('kk-mm-ss');
        var mstartdate = moment(this.event_start_date).format('YYYY-MM-DD');
        // var mendtime = this.single_end_time_hour + ':' + this.single_end_time_min;
        // var mendtime = moment(this.end_time).format('kk-mm-ss');;
        var menddate = moment(this.event_end_date).format('YYYY-MM-DD');
        this.singleEventData.event_start_date = mstartdate + ' ' + mstarttime;
        this.singleEventData.event_end_date = menddate + ' ' + mendtime;
        console.log(this.singleEventData.event_start_date);
        console.log(this.singleEventData.event_end_date);
        let data: EventsList = Object.assign({}, this.singleEventData);
        data.status = data.status ? this.EVENT_STATUS_ENABLED : this.EVENT_STATUS_DISABLED;
        data.is_header_required = data.is_header_required ? 1 : 0;
        this.service.saveSingleEvent(data).subscribe(res => {
            console.log(res);
            if (res.success) {
                this.pageService.showSuccess("Event saved successfully.");
                this._clearImageInputs();
                this.getEventsList();
                this.refreshSingleEventData();
                this.event_start_date = new Date();
                this.event_end_date = new Date();
                this.start_time = new Date();
                this.end_time = new Date();
                this.editorView = null;
                this.editorDiv = null;
                this.imageShow = false;
                this.dialogDisplay = false;
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
            this.showLoader = false;
        });
    }

    private _clearImageInputs(): void {

        if (this.phoneHeaderImageTarget) {
            this.phoneHeaderImageTarget.value = null;
            this.singleEventData.phone_header_image = null;
        }
        if (this.tabletHeaderImageTarget) {
            this.tabletHeaderImageTarget.value = null;
            this.singleEventData.tablet_header_image = null;
        }

    }

    public getEventsList(): void {
        this.service.getEventsList(this.tabId, this.settings.sort_by).subscribe(res => {
            if (res.success) {
                this.eventsList = res.data.eventsList;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCheckAllChange(): void {
        // this.checkTrue = !this.checkTrue;
        this.refreshSelectedItems();
        if (!this.checkAll) {
            for (let i in this.eventsList) {
                this.selectedItem[this.eventsList[i].id] = true;
            }
            this.checkTrue = true;
        }
        else {
            for (let i in this.eventsList) {
                this.selectedItem[this.eventsList[i].id] = false;
            }
            this.checkTrue = false;
        }
    }

    public refreshSelectedItems(): void {
        this.selectedItem = [];
    }

    public onEventDeleteClick(): void {
        if (this.selectedItem.length > 0 && this.selectedItem.indexOf(true) !== -1) {
            var yes = window.confirm("Do you really want to delete item? ");
            if (yes) {
                this.deleteEvent();
            }
        }
    }

    public deleteEvent(): void {
        let ids: any[] = [];
        for (let i in this.selectedItem) {
            if (this.selectedItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteEvent(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkTrue = false;
                this.selectedItem = [];
                for (var i = 0; i < ids.length; i++) {
                    this.eventsList.forEach((eventsList, index) => {
                        if (eventsList.id == ids[i]) {
                            this.eventsList.splice(index, 1);
                        }
                    });
                }
                this.pageService.showSuccess(res.message);
                this.checkAll = false;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortEvents(): void {
        let ids: number[] = [];
        for (let item of this.eventsList) {
            ids.push(item.id);
        }
        this.service.sortEvents(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.data);
            } else {
                this.pageService.showError(res.data);
            }
        });
    }

    public deleteImage(imageType: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteImage(imageType, id).subscribe(res => {
                    console.log(imageType);
                    console.log(res);
                    if (res.success) {
                        if (imageType == "phone_header") {
                            this.singleEventData.phone_header_image = null;
                            this.phoneHeaderImageTarget = null;
                            this.singleEventData.phone_header_image_url = null;
                        }
                        else if (imageType == "tablet_header") {
                            this.singleEventData.tablet_header_image = null;
                            this.tabletHeaderImageTarget = null;
                        }
                        this.pageService.showSuccess("Image deleted successfully.");
                        this._clearImageInputs();
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    public getCommentData(id): void {
        this.service.getCommentData(id).subscribe(res => {
            if (res.success) {
                this.comments = res.data;
                console.log(this.comments);
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onCommentDeleteClick(id: number): void {
        this.deleteCommentId = id;
        this.showDeleteCommentDialog = true;
        this.pageService.onDialogOpen();
    }

    public deleteComment(): void {
        this.showLoader = true;
        this.service.deleteComment([this.deleteCommentId]).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.showDeleteCommentDialog = false;
                this.pageService.showSuccess('Comment Deleted Successfully');
                this.comments.forEach((comment, index) => {
                    if (comment.id === this.deleteCommentId) {
                        this.comments.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onLocationClick(id: number): void {
        this.addFormlocationEditorDisplay = false;
        this.service.getSingleEventContactData(id).subscribe((res) => {
            if (res.success) {
                this.contactList = res.data.contactList;
                this.singleEventData.address_sec_1 = res.data.contactList.address_sec_1;
                this.singleEventData.address_sec_2 = res.data.contactList.address_sec_2;
                this.singleEventData.m_lat = res.data.contactList.m_lat;
                this.singleEventData.m_long = res.data.contactList.m_long;
            }
        });
    }

    public onGoingDeleteClick(id: number): void {
        this.deleteGoingId = id;
        this.showDeleteGoingDialog = true;
        this.pageService.onDialogOpen();
    }

    public deleteGoing(): void {
        this.showLoader = true;
        this.service.deleteGoing([this.deleteGoingId]).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.showDeleteGoingDialog = false;
                this.pageService.showSuccess('Going Deleted Successfully');
                this.goings.forEach((going, index) => {
                    if (going.id === this.deleteGoingId) {
                        this.goings.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public onEventImagesChange(event: any): void {
        this.eventImageTarget = event.target;
        this.imageData.image = event.target.files;
    }

    public onEventImage(id): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.imageData.event_id = this.singleEventData.id;
        this.service.saveImages(this.imageData).subscribe(res => {
            if (res.success) {
                this.pageService.showSuccess(res.message);
                this.getImageData(this.imageData.event_id);
                this.imageData = new ImageList();
                this._clearEventImageInputs();
            }
            else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
            this.showLoader = false;
        });
    }

    public deleteEventImage(id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteEventImage(id).subscribe(res => {
                    console.log(res);
                    if (res.success) {
                        this.pageService.showSuccess("Image deleted successfully.");
                        this.dataService.getByID(this.imageList, id, (data, index) => {
                            this.imageList.splice(index, 1);
                        });
                        this._clearEventImageInputs();
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }
    private _clearEventImageInputs(): void {

        if (this.eventImageTarget) {
            this.eventImageTarget.value = null;
            this.imageData.image = null;
        }
    }

    public getImageData(id): void {
        this.service.getImageEventData(id).subscribe(res => {
            if (res.success) {
                this.imageList = res.data.images;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortImages(): void {
        let ids: number[] = [];
        for (let item of this.imageList) {
            ids.push(item.id);
        }
        this.service.sortImages(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.data);
            } else {
                this.pageService.showError(res.data);
            }
        });
    }
    /******************************END OF SINGLE EVENT********************************************/
    /******************************START OF RECURRING EVENT***************************************/
    public showRecurringDialog() {
        this.listEventItemDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    public showaddRecurringEventDialog() {
        this.showEditor = 'recurring';
        this.eventHeader = 'ADD NEW RECURRING EVENT';
        this.recurringEventDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.recur_end_date = moment(this.recur_end_date).format('MM/DD/YYYY');
        this.repeat_date = moment(this.repeat_date).format('MM/DD/YYYY');
        // this.showEditor = true;
        this.imageShow = true;
        this.initEditor('recurring');
        this.refreshRecEventData();
    }

    public showEditRecurringEventDialog(id: number) {
        this.eventHeader = 'EDIT RECURRING EVENTS DETAILS';
        this.recurringEventDialogDisplay = true;
        this.pageService.onDialogOpen();
        this.imageShow = true;
        this.showEditor = 'recurring';

        this.service.getSingleRecurringEventData(id).subscribe((res) => {
            if (res.success) {
                this.recurringEventData = res.data.recurringEventData;
                this.initEditor('recurring');
                this.recurringEventData.status = (res.data.recurringEventData.status == 1) ? true : false;
                this.recurringEventData.is_header_required = (res.data.recurringEventData.is_header_required == 1) ? true : false;
                if (res.data.recurringEventData.phone_header_image) {
                    this.recurringEventData.phone_header_image_url = res.data.recurringEventData.phone_header_image;
                }
                if (res.data.recurringEventData.end_date) {
                    this.recur_end_date = moment(res.data.recurringEventData.end_date).format('MM/DD/YYYY');
                }
                if (res.data.recurringEventData.repeat_date) {
                    this.repeat_date = moment(res.data.recurringEventData.repeat_date).format('MM/DD/YYYY');
                }
                if (res.data.recurringEventData.start_time_hour) {
                    let hour = res.data.recurringEventData.start_time_hour;
                    if (hour >= '12') {
                        this.event_meredian = 2;
                    }
                    if (hour == '13') {
                        this.start_time_hour = '1'
                    } else if (hour == '14') {
                        this.start_time_hour = '2'
                    } else if (hour == '15') {
                        this.start_time_hour = '3'
                    } else if (hour == '16') {
                        this.start_time_hour = '4'
                    } else if (hour == '17') {
                        this.start_time_hour = '5'
                    } else if (hour == '18') {
                        this.start_time_hour = '6'
                    } else if (hour == '19') {
                        this.start_time_hour = '7'
                    } else if (hour == '20') {
                        this.start_time_hour = '8'
                    } else if (hour == '21') {
                        this.start_time_hour = '9'
                    } else if (hour == '22') {
                        this.start_time_hour = '10'
                    } else if (hour == '23') {
                        this.start_time_hour = '11'
                    } else if (hour == '12') {
                        this.start_time_hour = '00'
                    } else {
                        this.start_time_hour = res.data.recurringEventData.start_time_hour;
                    }
                }
                if (res.data.recurringEventData.start_time_min) {
                    this.start_time_min = res.data.recurringEventData.start_time_min;
                }
                // let startTime = moment(res.data.recurringEventData.start_time).format();
                // this.rec_start_time = new Date(startTime);
                if (res.data.recurringEventData.duration_hour) {
                    this.duration_hour = res.data.recurringEventData.duration_hour;
                }
                if (res.data.recurringEventData.duration_min) {
                    this.duration_min = res.data.recurringEventData.duration_min;
                }
                if (res.data.recurringEventData.day_of_week) {
                    this.recurringEventData.day_of_week = res.data.recurringEventData.day_of_week.split(",");
                }
                else {
                    this.recurringEventData.day_of_week = [];
                }
                if (res.data.recurringEventData.imported_location) {
                    this.show = 1;

                }
                console.log(this.recurringEventData);
            }

        });
    }

    public onCheckAllChangeRecurring(): void {
        // this.checkItemTrue = !this.checkItemTrue;
        this.refreshSelectedItems();
        if (!this.checkAllRecurring) {
            for (let i in this.recurringEventList) {
                this.selectedRecurringItem[this.recurringEventList[i].id] = true;
            }
            this.checkItemTrue = true;
        }
        else {
            for (let i in this.recurringEventList) {
                this.selectedRecurringItem[this.recurringEventList[i].id] = false;
            }
            this.checkItemTrue = false;
        }
    }

    public onRecurringEventDeleteClick(): void {
        if (this.selectedRecurringItem.length > 0 && this.selectedRecurringItem.indexOf(true) !== -1) {
            var yes = window.confirm("Are you sure you want to delete the selected item ? ");
            if (yes) {
                this.deleteRecurringEvent();
            }
        }
    }

    public deleteRecurringEvent(): void {
        let ids: any[] = [];
        for (let i in this.selectedRecurringItem) {
            if (this.selectedRecurringItem[i]) {
                ids.push(i);
            }
        }
        this.showLoader = true;
        this.service.deleteRecurringEvent(ids).subscribe((res) => {
            if (res.success) {
                this.showLoader = false;
                this.checkItemTrue = false;
                this.selectedRecurringItem = [];
                this.getRecurringEventsList();
                this.pageService.showSuccess(res.message);
                this.checkAllRecurring = false;
                this.recurringEventList.forEach((item, index) => {
                    if (item.id === this.selectedRecurringItem['id']) {
                        this.recurringEventList.splice(index, 1);
                    }
                });
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public getRecurringEventsList(): void {
        this.service.getRecurringEventsList(this.tabId).subscribe(res => {
            if (res.success) {
                this.recurringEventList = res.data.recurringEventList;
                this.ready = true;
            } else {
                this.pageService.showError(res.message);
            }
        });
    }

    public sortRecurringEvents(): void {
        let ids: number[] = [];
        for (let item of this.recurringEventList) {
            ids.push(item.id);
        }
        this.service.sortRecurringEvents(ids).subscribe((res) => {
            if (res.success) {
                this.pageService.showSuccess(res.data);
            } else {
                this.pageService.showError(res.data);
            }
        });
    }
    public onImportedLocationRecurringClick(): void {
        this.show = !this.recurringEventData.imported_location ? 1 : 2;
        if (this.recurringEventData.imported_location === true) {
            this.recAddFormlocationEditorDisplay = false;
            this.recurringEventData.address_sec_1 = null;
            this.recurringEventData.address_sec_2 = null;
            this.recurringEventData.m_lat = null;
            this.recurringEventData.m_long = null;
            this.recurringEventData.location_id = null;
        }
    }


    public onRecurringLocationClick(id: number): void {
        this.recAddFormlocationEditorDisplay = false;
        this.service.getSingleEventContactData(id).subscribe((res) => {
            if (res.success) {
                this.contactList = res.data.contactList;
                this.recurringEventData.address_sec_1 = res.data.contactList.address_sec_1;
                this.recurringEventData.address_sec_2 = res.data.contactList.address_sec_2;
                this.recurringEventData.m_lat = res.data.contactList.m_lat;
                this.recurringEventData.m_long = res.data.contactList.m_long;
            }
        });
    }

    public onPhoneHeaderImageRecurringChange(event: any): void {
        this.phoneHeaderImageTarget = event.target;
        this.recurringEventData.phone_header_image = event.file[0];
    }

    public onTabletHeaderImageRecurringChange(event: any): void {
        this.tabletHeaderImageTarget = event.target;
        this.recurringEventData.tablet_header_image = event.file[0];
    }

    public onSaveRecurringEvent(): void {
        this.showLoader = true;
        this.addSaveButtonHide = true;
        this.recurringEventData.tab_id = this.tabId;
        if (this.editorView) {
            this.recurringEventData.description = this.editorView.html();
        }
        var mendRecurringdate = moment(this.recur_end_date).format('YYYY-MM-DD');
        this.recurringEventData.end_date = mendRecurringdate;
        // this.recurringEventData.start_time = moment(this.rec_start_time).format('kk-mm-ss');
        if (this.event_meredian == 1) { // AM
            if (parseInt(this.start_time_hour) === 12) {
                this.start_time_hour = '0';
            }
            this.recurringEventData.start_time = this.start_time_hour + ':' + this.start_time_min;
        } else { // PM
            if (parseInt(this.start_time_hour) !== 12) {
                this.start_time_hour = (parseInt(this.start_time_hour) + 12).toString();
            }
            this.recurringEventData.start_time = this.start_time_hour + ':' + this.start_time_min;
        }
        console.log(this.recurringEventData.start_time);
        this.recurringEventData.duration = this.duration_hour + ':' + this.duration_min;
        var mrepeatdate = moment(this.repeat_date).format('YYYY-MM-DD');
        this.recurringEventData.repeat_date = mrepeatdate;
        let data: RecurringEvents = Object.assign({}, this.recurringEventData);
        data.status = data.status ? this.EVENT_STATUS_ENABLED : this.EVENT_STATUS_DISABLED;
        data.is_header_required = data.is_header_required ? 1 : 0;
        this.service.saveRecurringEvent(data).subscribe(res => {
            console.log(res);
            if (res.success) {
                this.pageService.showSuccess("Recurring Event saved successfully.");
                this._clearRecurringImageInputs();
                this.getRecurringEventsList();
                // this.rec_start_time = new Date();
                this.start_time_min = null;
                this.start_time_hour = null;
                this.duration_min = null;
                this.duration_hour = null;
                this.refreshRecEventData();
                this.recur_end_date = new Date(new Date().getFullYear(), 11, 31);
                this.imageShow = false;
                this.editorView = null;
                this.editorDiv = null;
                this.recurringEventDialogDisplay = false;
                this.getEventsList();
            } else {
                this.pageService.showError(res.message);
            }
            this.addSaveButtonHide = false;
            this.showLoader = false;
        });
    }

    public deleteRecurringImage(imageType: string, id: number): void {
        if (id) {
            var yes = window.confirm("Do you really want to delete item. ");
            if (yes) {
                this.service.deleteRecurringImage(imageType, id).subscribe(res => {
                    console.log(imageType);
                    console.log(res);
                    if (res.success) {
                        if (imageType == "phone_header") {
                            this.recurringEventData.phone_header_image = null;
                            this.phoneHeaderImageTarget = null;
                            this.recurringEventData.phone_header_image_url = null;
                        }
                        else if (imageType == "tablet_header") {
                            this.recurringEventData.tablet_header_image = null;
                            this.tabletHeaderImageTarget = null;
                        }
                        this.pageService.showSuccess("Image deleted successfully.");
                        this._clearRecurringImageInputs();
                    }
                    else
                        this.pageService.showError(res.message);
                });
            }
        }
    }

    private _clearRecurringImageInputs(): void {

        if (this.phoneHeaderImageTarget) {
            this.phoneHeaderImageTarget.value = null;
            this.recurringEventData.phone_header_image = null;
        }
        if (this.tabletHeaderImageTarget) {
            this.tabletHeaderImageTarget.value = null;
            this.recurringEventData.tablet_header_image = null;
        }

    }

    public onRecurringDialogHide(): void {
        this._clearRecurringImageInputs();
        this.editorView = null;
        this.editorDiv = null;
        this.imageShow = false;
        this.imagesTab = false;
        this.goingTab = false;
        this.commentsTab = false;
        this.show = 2;
        this.duration_min = '0';
        this.duration_hour = null;
        // this.rec_start_time = new Date();
        this.start_time_hour = '0';
        this.start_time_min = '0';
        this.recur_end_date = new Date(new Date().getFullYear(), 11, 31);
        this.refreshRecEventData();
        this.recAddFormlocationEditorDisplay = false;
    }

    public onRecLatLongChange(event: any): void {
        if (this.recurringEventData.m_lat) {
            this.recurringEventData.m_lat = null
        }
        if (this.recurringEventData.m_long) {
            this.recurringEventData.m_long = null
        }
        this.recurringEventData.m_lat = event.lat;
        this.recurringEventData.m_long = event.long;
    }

    /******************************END OF RECURRING EVENT***************************************/

    /**********************************************IMPORT EVENTS******************************/
    public showImportEventDialog(): void {
        this.importEventsDialogDisplay = true;
        this.pageService.onDialogOpen();
    }

    // disable enter keyCode
    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.which == 13 || event.keyCode == 13)
            event.preventDefault();
    }

    public refreshSingleEventData(): void {
        this.singleEventData.id = null;
        this.singleEventData.tab_id = null;
        this.singleEventData.phone_header_image = null;
        this.singleEventData.tablet_header_image = null;
        this.singleEventData.event_start_date = null;
        this.singleEventData.event_end_date = null;
        this.singleEventData.name = null;
        this.singleEventData.status = true;
        this.singleEventData.description = null;
        this.singleEventData.imported_location = false;
        this.singleEventData.location_id = null;
        this.singleEventData.address_sec_1 = null;
        this.singleEventData.address_sec_2 = null;
        this.singleEventData.m_lat = null;
        this.singleEventData.m_long = null;
    }

    public refreshRecEventData(): void {
        this.recurringEventData.id = null;
        this.recurringEventData.tab_id = null;
        this.recurringEventData.phone_header_image = null;
        this.recurringEventData.tablet_header_image = null;
        this.recurringEventData.phone_header_image_url = null;
        this.recurringEventData.start_time = null;
        this.recurringEventData.end_date = new Date();
        this.recurringEventData.name = null;
        this.recurringEventData.status = true;
        this.recurringEventData.description = null;
        this.recurringEventData.imported_location = false;
        this.recurringEventData.location_id = null;
        this.recurringEventData.address_sec_1 = null;
        this.recurringEventData.address_sec_2 = null;
        this.recurringEventData.m_lat = 80.946166;
        this.recurringEventData.m_long = 26.846694;
        this.recurringEventData.repeat_event = 1;
        this.recurringEventData.duration = null;
        this.recurringEventData.day_of_week = ['Sunday'];
        this.recurringEventData.repeat_date = new Date();
    }

    public onCheckTabChange(checkedTabValue, checkedTab): void {
        // this.checkTrue = !this.checkTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.eventsList.forEach((eventsList) => {
                console.log('eventsList', eventsList);
                console.log('checkedTab', checkedTab);
                if (eventsList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedItem[eventsList.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAll = flag ? true : false;
    }

    public onCheckRecurringTabChange(checkedTabValue, checkedTab): void {
        // this.checkItemTrue = !this.checkItemTrue;
        console.log('checkedTabValue', checkedTabValue);
        console.log('checkedTab', checkedTab);
        let flag: boolean = true;
        if (checkedTabValue) {
            flag = false;
        } else {
            this.recurringEventList.forEach((recurringEventList) => {
                console.log('recurringEventList', recurringEventList);
                console.log('checkedTab', checkedTab);
                if (recurringEventList.id != checkedTab) {
                    //if flag set to false don't check further
                    if (flag) {
                        if (this.selectedRecurringItem[recurringEventList.id]) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                    }
                }
            });
        }
        this.checkAllRecurring = flag ? true : false;
    }
    private initEditor(type: string): void {
        setTimeout(() => {
            this.editorDiv = window["_globalJQuery"]("div#description-editor");
            this.editorDiv.froalaEditor({
                fileUploadURL: this.pageService.editorURLs.fileUpload,
                videoUploadURL: this.pageService.editorURLs.videoUpload,
                imageUploadURL: this.pageService.editorURLs.imageUpload + "/" + sessionStorage.getItem('appId'),
                imageManagerLoadURL: this.pageService.editorURLs.imageManagerLoad + "/" + sessionStorage.getItem('appId'),
            });
            this.editorView = this.editorDiv.find(".fr-view");
            if (type === 'single' ? this.singleEventData.description : this.recurringEventData.description) {
                this.editorDiv.froalaEditor('placeholder.hide')
            }
            this.editorView.html(type === 'single' ? this.singleEventData.description : this.recurringEventData.description);
        });
    }

    private convertTo24HourFormat(hour: number, minute: number, meridian: number): string {
        if (meridian == 1 && hour == 12) {
            hour = 0;
        } else if (meridian == 2 && hour != 12) {
            hour += 12;
        }
        return hour.toString() + ":" + minute.toString();
    }

    private setSingleEventStartAndEndTimes(startTime: Date, endTime: Date): void {
        let startTimeHours: number = startTime.getHours();
        let endTimeHours: number = endTime.getHours();
        this.single_event_start_meredian = startTimeHours < 12 ? 1 : 2;
        this.single_event_end_meredian = endTimeHours < 12 ? 1 : 2;

        this.single_start_time_hour = this.convertHoursTo12HourFormat(startTimeHours);
        this.single_start_time_min = startTime.getMinutes();

        this.single_end_time_hour = this.convertHoursTo12HourFormat(endTimeHours);
        this.single_end_time_min = endTime.getMinutes();
    }

    private convertHoursTo12HourFormat(hours: number): number {
        if (hours == 0) {
            hours = 12;
        } else if (hours > 12) {
            hours = hours - 12;
        }
        return hours;
    }
}
import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { DisplayService, GlobalService, DataService } from '../../providers';
import { Note as NotePage } from "../note/note";
import { SQLite } from "ionic-native";
import { Note } from "../../interfaces";

@Component({
    selector: 'page-notepad',
    templateUrl: 'notepad.html'
})
export class Notepad {

    public title: string;
    public tabId: number;
    public bgImage: number;
    public db: SQLite;
    public notes: Note[] = [];
    public loader: boolean = true;
    public state: boolean = false;
    public searchIcon: boolean = true;
    public noteSearch: string;
    public tab_nav_type: string = null;
    public subTabId: number = null;


    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public display: DisplayService,
        public globalService: GlobalService,
        public platform: Platform,
        public dataService: DataService
    ) {
        this.tabId = navParams.get("tabId");
        this.title = navParams.get("title");
        this.bgImage = navParams.get("bgImage");
        this.tab_nav_type = navParams.get('tab_nav_type');
        this.subTabId = navParams.get('subTabId');
        this.globalService.checkTabAddedInEmailMarketting(this.tabId);
        platform.ready().then(() => {
            this.openDB();
        });
    }

    public ionViewDidEnter(): void {
        switch (this.globalService.noteActionStatus) {
            case this.globalService.noteActionStatuses.CREATED:
                this.notes.unshift(this.globalService.actedNote);
                this.reset();
                break;
            case this.globalService.noteActionStatuses.EDITED:
                this.dataService.getByID(this.notes, this.globalService.actedNote.id, (data, index) => {
                    data.body = this.globalService.actedNote.body;
                });
                break;
            case this.globalService.noteActionStatuses.DELETED:
                this.dataService.getByID(this.notes, this.globalService.actedNote.id, (data, index) => {
                    this.notes.splice(index, 1);
                    this.reset();
                });
                break;
        }
    }

    public ionViewWillLeave(): void {
        this.globalService.noteActionStatus = this.globalService.noteActionStatuses.IDLE;
    }

    public openDB(): void {
        this.db = new SQLite();
        this.db.openDatabase({
            name: 'tappit.db',
            location: 'default'
        }).then(() => {
            this.createTable();
        }).catch(err => {
            this.handleDBError(err);
        });
    }

    public createTable(): void {
        this.db.executeSql("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, body TEXT, created_at DATETIME DEFAULT NULL)", {}).then(() => {
            console.log("notes table created/already exists");
            this.getNotesList();
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }

    public onAddClick(): void {
        this.navCtrl.push(NotePage, {
            tabId: this.tabId,
            bgImage: this.bgImage
        });
    }

    public handleDBError(err: any): void {
        console.log(err);
        this.display.showToast("Error occured");
        this.navCtrl.pop();
    }

    public getNotesList(): void {
        this.db.executeSql("SELECT id, body, created_at FROM notes ORDER BY created_at DESC", {}).then(resultSet => {
            for (let i = 0; i < resultSet.rows.length; i++) {
                this.notes.push(resultSet.rows.item(i));
            }
            console.log(this.notes);
            this.loader = false;
        }, err => {
            this.handleDBError(err);
        });
    }

    public onNoteClick(note: Note): void { 
        this.navCtrl.push(NotePage, {
            tabId: this.tabId,
            bgImage: this.bgImage,
            id: note.id,
            note: note.body,
        });
    }

    public search(): void {
        this.state = true;
        this.searchIcon = false;
    }

    public onCancel(): void {
        this.state = false;
        this.searchIcon = true;
    }

    public reset(): void {
        this.notes = this.notes.slice();
    }

}
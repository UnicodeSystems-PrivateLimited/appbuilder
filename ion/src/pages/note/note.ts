import { Component } from '@angular/core';
import { NavController, Platform, NavParams } from 'ionic-angular';
import { SQLite } from "ionic-native";
import { DisplayService, GlobalService } from '../../providers';
import { Note as NoteEntity } from "../../interfaces";
import moment from 'moment';

/*
  Generated class for the Note page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-note',
    templateUrl: 'note.html'
})
export class Note {

    public db: SQLite;
    public tabId: number;
    public note: string = "";
    public id: number = null;
    public bgImage: string;

    constructor(
        public navCtrl: NavController,
        public globalService: GlobalService,
        public display: DisplayService,
        public platform: Platform,
        public navParams: NavParams
    ) {
        this.tabId = navParams.get("tabId");
        this.bgImage = navParams.get("bgImage");
        this.id = navParams.get("id") || this.id;
        this.note = navParams.get("note") || this.note;
        platform.ready().then(() => {
            this.openDB();
        });
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
        }, err => {
            console.log("Table couldn't be created or opened :(");
            this.handleDBError(err);
        });
    }

    public handleDBError(err: any): void {
        console.log(err);
        this.display.showToast("Error occured");
        this.navCtrl.pop();
    }

    public saveNote(): void {
        if (!this.id) {
            this.insertNote();
        } else {
            this.updateNote();
        }
    }

    public insertNote(): void {
        let createdAt: string = moment().format();
        this.db.executeSql("INSERT INTO notes (body, created_at) VALUES (?, ?)", [this.note, createdAt]).then(resultSet => {
            this.globalService.noteActionStatus = this.globalService.noteActionStatuses.CREATED;
            this.globalService.actedNote = new NoteEntity();
            this.globalService.actedNote.id = resultSet.insertId;
            this.globalService.actedNote.body = this.note;
            this.globalService.actedNote.created_at = createdAt;
            this.display.showToast("Note saved.");
            this.navCtrl.pop();
        }, err => {
            this.handleDBError(err);
        }); 
    }

    public updateNote(): void {
        this.db.executeSql("UPDATE notes SET body=? WHERE id=?", [this.note, this.id]).then(resultSet => {
            this.globalService.noteActionStatus = this.globalService.noteActionStatuses.EDITED;
            this.globalService.actedNote = new NoteEntity();
            this.globalService.actedNote.id = this.id;
            this.globalService.actedNote.body = this.note;
            this.display.showToast("Note saved.");
            this.navCtrl.pop();
        }, err => {
            this.handleDBError(err);
        });
    }

    public onDeleteClick(): void {
        this.display.showConfirm("", "Are you sure you want to delete this note ?", () => this.deleteNote());
    }

    public deleteNote(): void {
        this.db.executeSql("DELETE FROM notes WHERE id=?", [this.id]).then(() => {
            this.globalService.noteActionStatus = this.globalService.noteActionStatuses.DELETED;
            this.globalService.actedNote = new NoteEntity();
            this.globalService.actedNote.id = this.id;
            this.display.showToast("Note deleted.");
            this.navCtrl.pop();
        }, err => {
            this.handleDBError(err);
        });
    }

}

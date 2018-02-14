import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { MailingListService, DisplayService } from '../../providers';
import { MailingListUsers } from "../../interfaces/common-interfaces";
import { LaunchNavigator } from "ionic-native";
import { GlobalService } from '../../providers';
/*
  Generated class for the MailingListTab page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-mailing-list-tab',
  templateUrl: 'mailing-list-tab.html'
})
export class MailingListTab {
  public tabId: number;
  public title: string;
  public bgImage: string;
  public loader: boolean = false;
  public settings: any = {};
  public countries: any;
  public categories: any[] = [];
  public selectedItem: boolean[] = [];
  public tab_nav_type: string = null;
  public subTabId: number = null;

  public userData: MailingListUsers = new MailingListUsers();
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    public service: MailingListService,
    public display: DisplayService,
    public globalService: GlobalService
  ) {
    this.tabId = navParams.get('tabId');
    this.title = navParams.get('title');
    this.bgImage = navParams.get('bgImage');
    this.tab_nav_type = navParams.get('tab_nav_type');
    this.subTabId = navParams.get('subTabId');
    this.globalService.checkTabAddedInEmailMarketting(this.tabId);
    this.countries = [
      "Albania",
      "Algeria",
      "Andorra",
      "Angola",
      "Antigua and Barbuda",
      "Argentina",
      "Armenia",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahamas",
      "Bahrain",
      "Bangladesh",
      "Barbados",
      "Belarus",
      "Belgium",
      "Belize",
      "Benin",
      "Bhutan",
      "Bolivia",
      "Bosnia and Herzegovina",
      "Botswana",
      "Brazil",
      "Brunei Darussalam",
      "Bulgaria",
      "Burkina Faso",
      "Burundi",
      "Cabo Verde",
      "Cambodia",
      "Cameroon",
      "Canada",
      "Central African Republic",
      "Chad",
      "Chile",
      "China",
      "Colombia",
      "Comoros",
      "Congo",
      "Costa Rica",
      "Côte d'Ivoire",
      "Croatia",
      "Cuba",
      "Cyprus",
      "Czech Republic",
      "Democratic People's Republic of Korea (North Korea)",
      "Democratic Republic of the Cong",
      "Denmark",
      "Djibouti",
      "Dominica",
      "Dominican Republic",
      "Ecuador",
      "Egypt",
      "El Salvador",
      "Equatorial Guinea",
      "Eritrea",
      "Estonia",
      "Ethiopia",
      "Fiji",
      "Finland",
      "France",
      "Gabon",
      "Gambia",
      "Georgia",
      "Germany",
      "Ghana",
      "Greece",
      "Grenada",
      "Guatemala",
      "Guinea",
      "Guinea-Bissau",
      "Guyana",
      "Haiti",
      "Honduras",
      "Hungary",
      "Iceland",
      "India",
      "Indonesia",
      "Iran",
      "Iraq",
      "Ireland",
      "Israel",
      "Italy",
      "Jamaica",
      "Japan",
      "Jordan",
      "Kazakhstan",
      "Kenya",
      "Kiribati",
      "Kuwait",
      "Kyrgyzstan",
      "Lao People's Democratic Republic (Laos)",
      "Latvia",
      "Lebanon",
      "Lesotho",
      "Liberia",
      "Libya",
      "Liechtenstein",
      "Lithuania",
      "Luxembourg",
      "Macedonia",
      "Madagascar",
      "Malawi",
      "Malaysia",
      "Maldives",
      "Mali",
      "Malta",
      "Marshall Islands",
      "Mauritania",
      "Mauritius",
      "Mexico",
      "Micronesia (Federated States of)",
      "Monaco",
      "Mongolia",
      "Montenegro",
      "Morocco",
      "Mozambique",
      "Myanmar",
      "Namibia",
      "Nauru",
      "Nepal",
      "Netherlands",
      "New Zealand",
      "Nicaragua",
      "Niger",
      "Nigeria",
      "Norway",
      "Oman",
      "Pakistan",
      "Palau",
      "Panama",
      "Papua New Guinea",
      "Paraguay",
      "Peru",
      "Philippines",
      "Poland",
      "Portugal",
      "Qatar",
      "Republic of Korea (South Korea)",
      "Republic of Moldova",
      "Romania",
      "Russian Federation",
      "Rwanda",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Vincent and the Grenadines",
      "Samoa",
      "San Marino",
      "Sao Tome and Principe",
      "Saudi Arabia",
      "Senegal",
      "Serbia",
      "Seychelles",
      "Sierra Leone",
      "Singapore",
      "Slovakia",
      "Slovenia",
      "Solomon Islands",
      "Somalia",
      "South Africa",
      "South Sudan",
      "Spain",
      "Sri Lanka",
      "Sudan",
      "Suriname",
      "Swaziland",
      "Sweden",
      "Switzerland",
      "Syrian Arab Republic",
      "Tajikistan",
      "Thailand",
      "Timor-Leste",
      "Togo",
      "Tonga",
      "Trinidad and Tobago",
      "Tunisia",
      "Turkey",
      "Turkmenistan",
      "Tuvalu",
      "Uganda",
      "Ukraine",
      "United Arab Emirates",
      "United Kingdom of Great Britain and Northern Ireland",
      "United Republic of Tanzania",
      "United States of America",
      "Uruguay",
      "Uzbekistan",
      "Vanuatu",
      "Venezuela",
      "Vietnam",
      "Yemen",
      "Zambia",
      "Zimbabwe"

    ];
    this.getSettings();

  }

  public getSettings(): void {
    this.loader = true;
    this.service.getSettings(this.tabId).subscribe(res => {
      this.loader = false;
      if (res.success) {
        if (res.data) {
          this.settings = res.data;
        } else {
          console.log('No data found');
        }
        this.getCategoryList();
      } else {
        this.display.showToast("Could not fetch data");
      }
    });
  }

  public getCategoryList(): void {
    this.service.getCategories(this.tabId).subscribe(res => {
      this.loader = false;
      if (res.success) {
        this.categories = res.data;
        console.log(this.categories);
      } else {
        this.display.showToast("Could not fetch data");
      }
    });
  }

  public save(): void {
    this.userData.category_id = [];
    for (let i in this.selectedItem) {
      if (this.selectedItem[i]) {
        this.userData.category_id.push(i);
      }
    }
    this.userData.tab_id = this.tabId;
    this.loader = true;
    this.service.save(this.userData).subscribe(res => {
      this.loader = false;
      if (res.success) {
        this.display.showToast(res.message);
        this.userData = new MailingListUsers();
      } else {
        this.display.showToast(res.message);
      }
    });
  }

}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class FormDataService {

    public postData(url: string, data: any): Observable<any> {
        return Observable.create(observer => {
            let formData: FormData = new FormData();
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            for (let i in data) {
                if (data.hasOwnProperty(i)) {
                    if (data[i] instanceof FileList) {
                        let files: FileList = data[i];
                        for (let j = 0; j < files.length; j++) {
                            formData.append(i + "[]", files[j]);
                        }
                    } else {
                        // PHP interprets null sent by FormData as a string, which makes it 'not null'.
                        // So, we need to send empty string instead of null.
                        formData.append(i, data[i] === null || data[i] === undefined ? '' : data[i]);
                    }
                }
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };

            xhr.open('POST', url, true);
            xhr.send(formData);
        });
    }

    public postNestedData(url: string, nestedData: any): Observable<any> {
        return Observable.create(observer => {
            let formData: FormData = new FormData();
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            for (let index in nestedData) {
                let data = nestedData[index];
                if (typeof data === 'object') {
                    for (let i in data) {
                        // PHP interprets null sent by FormData as a string, which makes it 'not null'.
                        // So, we need to send empty string instead of null.
                        formData.append(index + "[" + i + "]", data[i] === null ? '' : data[i]);
                    }
                } else {
                    formData.append(index, data === null ? '' : data);
                }
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };

            xhr.open('POST', url, true);
            xhr.send(formData);
        });
    }

    public postCPanelNestedData(url: string, nestedData: any): Observable<any> {
        return Observable.create(observer => {
            let formData: FormData = new FormData();
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            for (let index in nestedData) {
                let data = nestedData[index];
                console.log("data[i] instanceof FileList", data);
                if (typeof data === 'object' && !(data instanceof FileList)) {
                    for (let i in data) {
                        let data1 = data[i];
                        console.log("data[i] instanceof FileList", data1);
                        if (typeof data1 === 'object') {
                            for (let j in data1) {
                                let data2 = data1[j];
                                if (typeof data2 === 'object') {

                                    for (let k in data2) {
                                        if (typeof data2[k] === 'object') {
                                            console.log("data2", data2[k]);
                                            for (let l in data2[k]) {
                                                formData.append(index + "[" + i + "]" + "[" + j + "]" + "[" + k + "]" + "[" + l + "]", data2[k][l] === null ? '' : data2[k][l]);
                                            }
                                        } else {
                                            formData.append(index + "[" + i + "]" + "[" + j + "]" + "[" + k + "]", data2[k] === null ? '' : data2[k]);
                                        }
                                    }
                                } else {
                                    formData.append(index + "[" + i + "]" + "[" + j + "]", data1[j] === null ? '' : data1[j]);
                                }
                            }
                        } else {
                            // PHP interprets null sent by FormData as a string, which makes it 'not null'.
                            // So, we need to send empty string instead of null.
                            formData.append(index + "[" + i + "]", data[i] === null ? '' : data[i]);
                        }
                    }
                } else if (data instanceof FileList) {
                    formData.append(index, data[0] === null ? '' : data[0]);
                } else {
                    formData.append(index, data === null ? '' : data);
                }
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };

            xhr.open('POST', url, true);
            xhr.send(formData);
        });
    }

    public postNestedLoyaltyData(url: string, nestedData: any): Observable<any> {
        return Observable.create(observer => {
            let formData: FormData = new FormData();
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            for (let index in nestedData) {
                let data = nestedData[index];
                if (typeof data === 'object') {
                    if (!(data instanceof FileList)) {
                        for (let i in data) {
                            let data1 = data[i];
                            if (typeof data1 === 'object') {
                                for (let j in data1) {
                                    let data2 = data1[j];
                                    formData.append(index + "[" + i + "]" + "[" + j + "]", data2 === null ? '' : data2);
                                }
                            }
                            else {
                                formData.append(index + "[" + i + "]", data1 === null ? '' : data1);
                            }
                        }
                    }
                    else {
                    formData.append(index, data[0] === null ? '' : data[0]);
                }
                } else {
                    formData.append(index, data === null ? '' : data);
                }
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };

            xhr.open('POST', url, true);
            xhr.send(formData);
        });

    }

      public postFormNestedData(url: string, nestedData: any): Observable<any> {
        return Observable.create(observer => {
            let formData: FormData = new FormData();
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            for (let index in nestedData) {
                let data = nestedData[index];
                if (typeof data === 'object') {
                    for (let i in data) {
                        if (typeof data[i] === 'object' || data[i] instanceof FileList) {
                            for (let j in data[i]) {
                                if (typeof data[i][j] == "object") {
                                    formData.append(index + "[" + i + "][" + j + "]", data[i][j] === null ? '' : data[i][j]);
                                    break;
                                } else {
                                    formData.append(index + "[" + i + "][" + j + "]", data[i][j] === null ? '' : data[i][j]);
                                }

                            }
                        } else {
                            // PHP interprets null sent by FormData as a string, which makes it 'not null'.
                            // So, we need to send empty string instead of null.
                            formData.append(index + "[" + i + "]", data[i] === null ? '' : data[i]);
                        }
                    }
                } else {
                    formData.append(index, data === null ? '' : data);
                }
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };

            xhr.open('POST', url, true);
            xhr.send(formData);
        });
    }
}
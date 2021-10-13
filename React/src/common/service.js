import { BehaviorSubject } from "rxjs";

const reloadListRequestSubject = new BehaviorSubject(null);
export const reloadListRequestObservable = reloadListRequestSubject.asObservable();
export const createReloadListRequest = () => {
    reloadListRequestSubject.next();
};

const newMessageBoxRequestSubject = new BehaviorSubject(null);
export const newMessageBoxRequestObservable = newMessageBoxRequestSubject.asObservable();
export const newMessageBoxRequest = (config) => {
    newMessageBoxRequestSubject.next(config);
};

const removeMessageBoxRequestSubject = new BehaviorSubject(null);
export const removeMessageBoxRequestObservable = removeMessageBoxRequestSubject.asObservable();
export const removeMessageBoxRequest = (id) => {
    removeMessageBoxRequestSubject.next(id);
};

const showLoaderRequestSubject = new BehaviorSubject(null);
export const showLoaderRequestObservable = showLoaderRequestSubject.asObservable();
export const showLoaderRequest = () => {
    showLoaderRequestSubject.next();
};

const hideLoaderRequestSubject = new BehaviorSubject(null);
export const hideLoaderRequestObservable = hideLoaderRequestSubject.asObservable();
export const hideLoaderRequest = () => {
    hideLoaderRequestSubject.next();
};

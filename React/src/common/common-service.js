import { BehaviorSubject } from "rxjs";

const reloadListRequestSubject = new BehaviorSubject(null);
export const reloadListRequestObservable = reloadListRequestSubject.asObservable();
export const createReloadListRequest = () => {
    reloadListRequestSubject.next();
};

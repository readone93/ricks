import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { BaseService } from "./../../core/base/base.service";
import { Injectable } from "@angular/core";

const routes = {
  category: "category",
};

@Injectable({
  providedIn: "root",
})
export class CategoriesService extends BaseService<any> {
  constructor(http: HttpClient) {
    super(http);
  }

  getAllCategories(): Observable<any> {
    return this.sendGet(this.baseUrl(routes.category));
  }

  getCategoryById(categoryId: number): Observable<any> {
    return this.sendGet(this.baseUrl(`${routes.category}/${categoryId}`));
  }
}

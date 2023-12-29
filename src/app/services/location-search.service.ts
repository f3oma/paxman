import { Injectable } from "@angular/core";
import algoliasearch from "algoliasearch";
import { environment } from "src/environments/environment";


@Injectable({
    providedIn: 'root'
})
    export class LocationSearchService {
  
    private algoliaSearch = algoliasearch(environment.algoliasearch.APP_ID, environment.algoliasearch.API_KEY);
    private idx = this.algoliaSearch.initIndex('dev_f3OmahaAOs');

    constructor() {

    }

    /**
    * @param partialLocationName Name provided to location
    * @returns All locations with a matching name
    */
    public async findByName(partialLocationName: string): Promise<any[]> {
        return this.idx.search(partialLocationName, {
            exactOnSingleWordQuery: "attribute",
            restrictSearchableAttributes: ['name'],
            typoTolerance: false
        }).then(({ hits }) => {
            return hits;
        });
    }
}
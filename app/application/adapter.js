import JSONAPIAdapter from '@ember-data/adapter/json-api';
import ENV from 'client-app/config/environment';
import {pluralize} from 'ember-inflector';

import AuthParams from '../utils/auth-params'

// TODO: Create custom HyperionAdapter
export default class ApplicationAdapter extends JSONAPIAdapter {
    host = ENV.API_HOST;
    namespace ='api/v4';

    get headers() {
        const params = AuthParams();

        return {
            'Authorization': `${params.msg} ${params.sig}`,
        };
    }

    pathForType(type) {
        return `rts/${pluralize(type)}`;
    }
}

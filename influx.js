import { InfluxDB, Point } from '@influxdata/influxdb-client'

class Logger {
    #writeApi
    #influxDB
    constructor({org, app, url, token, bucket}){
        this.#influxDB = new InfluxDB({ url, token });
        this.#writeApi = this.#influxDB.getWriteApi(org, bucket, 'ns'); // 'ns' for nanosecond precision
        this.#writeApi.useDefaultTags({ app });
    }

    writeLog = (level, message)=>{
        const point = new Point('logs')
            .tag('level', level)
            .stringField('message', message)
            .timestamp(new Date());

        this.#writeApi.writePoint(point);
        this.#writeApi.flush().catch(error => {
            console.error(`Error writing to InfluxDB! ${error.stack}`)
        });
    }

    writeMetric = (metric, value, tags = {}, fields = {}) => {
        
        const point = new Point('metrics')
            .tag('metric', metric)
            .floatField('value', value)
            .timestamp(new Date());
    
        // Add additional tags
        for (const [key, val] of Object.entries(tags)) {
            point.tag(key, val);
        }
    
        // Add additional fields
        for (const [key, val] of Object.entries(fields)) {
            point.floatField(key, val);
        }
    
        this.#writeApi.writePoint(point);
        this.#writeApi.flush().catch(error => {
            console.error(`Error writing to InfluxDB! ${error.stack}`)
        });
    }
    close = () => {
        this.#writeApi.close();
    }

    
}
export default Logger;

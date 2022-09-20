import { ChartTitleVisualDataList } from "igniteui-angular-charts";

export class ChartData {

  public static counter = 0;

  static readonly PROPERTY_TEMPLATE = 'gauge';

  [key: string]: any;

  public time: string = '';


  private static getPropertyName(idx: number): string {
    return `${this.PROPERTY_TEMPLATE}_${idx}`;
  }

  // function for adding new a property to the LineChartData class
  // return property name
  public static addChart(idx: number): string {
    const newPropertyName = ChartData.getPropertyName(idx);

    // adding a new property
    Object.defineProperties(ChartData.prototype, {
      newPropertyName: {
        configurable: true,
        writable: true,
        value: 0
      }
    });

    // returning a new property name
    return newPropertyName;
  }

  // function for creation of table header
  public static getHeaderCaption(propertyName: string): string {
    propertyName = propertyName.replace(/[_]+/, ' #');

    const arrStr = propertyName.split(' ');
    for (let i = 0; i < arrStr.length; i++) {
      arrStr[i] = arrStr[i].charAt(0).toUpperCase() + arrStr[i].slice(1);
    }

    return arrStr.join(' ');
  }


  // function for removal of property
  public deleteChart(idx: number) {
    const newPropertyName = ChartData.getPropertyName(idx);

    delete ChartData.prototype[newPropertyName];
  }

  // processing set of data
  // v - array of data
  public static processData( v: number[]): ChartData {


const d = new Date();

    // creating result onbject
    const result = {
      time: `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
    } as ChartData;

    // processing each array element
    // and assigning property
    if (Array.isArray(v)) {
      const len = v.length;
      for (let i = 1; i <= len; i++) {
        const propertyName = ChartData.getPropertyName(i);
        result[propertyName] = v[i];
      }
    }

    return result;
  }
}

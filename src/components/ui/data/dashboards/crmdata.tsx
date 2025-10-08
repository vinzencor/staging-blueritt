import face4 from "../../../../assets/images/faces/4.jpg";
import face15 from "../../../../assets/images/faces/15.jpg";
import face11 from "../../../../assets/images/faces/11.jpg";
import face8 from "../../../../assets/images/faces/8.jpg";
import face9 from "../../../../assets/images/faces/9.jpg";
import face10 from "../../../../assets/images/faces/10.jpg";
import face12 from "../../../../assets/images/faces/12.jpg";

//*** Total Customers--- Start ***//
export const Custseries = [{
    name: 'Value',
    data: [20, 14, 19, 10, 23, 20, 22, 9, 12]
}]
export const Custoptions:any = {
    colors: ["rgb(132, 90, 223)"],
    chart: {
        type: 'line',
        height: 40,
        width: 100,
        sparkline: {
            enabled: true
        },
        events: {
            mounted: (chart:any) => {
              chart.windowResizeHandler();
            }
          },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        type: 'gradient',
        gradient: {
            opacityFrom: 0.9,
            opacityTo: 0.9,
            stops: [0, 98],
        }
    },
    yaxis: {
        min: 0,
        show: false,
        axisBorder: {
            show: false
        },
    },
    xaxis: {
        // show: false,
        axisBorder: {
            show: false
        },
    },
    tooltip: {
        enabled: false,
    },
}
//*** Total Customers--- End ***//


//*** Total Revenue--- Start ***//
export const Revenueseries = [{
    name: 'Value',
    data: [20, 14, 20, 22, 9, 12, 19, 10, 25]
}]
export const Revenueoptions:any = {
    colors: ["rgb(35, 183, 229)"],
    chart: {
        type: 'line',
        height: 40,
        width: 100,
        sparkline: {
            enabled: true
        },
        events: {
            mounted: (chart:any) => {
              chart.windowResizeHandler();
            }
          },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        type: 'gradient',
        gradient: {
            opacityFrom: 0.9,
            opacityTo: 0.9,
            stops: [0, 98],
        }
    },
    yaxis: {
        min: 0,
        show: false,
        axisBorder: {
            show: false
        },
    },
    xaxis: {
        axisBorder: {
            show: false
        },
    },
    tooltip: {
        enabled: false,
    },
}
//*** Total Revenue--- End ***//


//*** Conversion Ratio--- Start ***//
export const Coverseries = [{
    name: 'Value',
    data: [20, 20, 22, 9, 14, 19, 10, 25, 12]
}]
export const Coveroptions:any = {
    colors: ["rgb(38, 191, 148)"],
    chart: {
        type: 'line',
        height: 40,
        width: 100,
        sparkline: {
            enabled: true
        },
        events: {
            mounted: (chart:any) => {
              chart.windowResizeHandler();
            }
          },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        type: 'gradient',
        gradient: {
            opacityFrom: 0.9,
            opacityTo: 0.9,
            stops: [0, 98],
        }
    },

    yaxis: {
        min: 0,
        show: false,
        axisBorder: {
            show: false
        },
    },
    xaxis: {
        axisBorder: {
            show: false
        },
    },
    tooltip: {
        enabled: false,
    },
}
//*** Conversion Ratio--- End ***//


//*** Total Deals--- Start ***//
export const Dealseries = [{
    name: 'Value',
    data: [20, 20, 22, 9, 12, 14, 19, 10, 25]
}]
export const Dealoptions:any = {
    colors: ["rgb(245, 184, 73)"],
    chart: {
        type: 'line',
        height: 40,
        width: 100,
        sparkline: {
            enabled: true
        },
        events: {
            mounted: (chart:any) => {
              chart.windowResizeHandler();
            }
          },
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: undefined,
        width: 1.5,
        dashArray: 0,
    },
    fill: {
        type: 'gradient',
        gradient: {
            opacityFrom: 0.9,
            opacityTo: 0.9,
            stops: [0, 98],
        }
    },
    yaxis: {
        min: 0,
        show: false,
        axisBorder: {
            show: false
        },
    },
    xaxis: {
        // show: false,
        axisBorder: {
            show: false
        },
    },
    tooltip: {
        enabled: false,
    },
}
//*** Total Deals--- End ***//


//***  Revenue Analytics--- Start ***//
export const Anaseries = [
    {
        type: 'line',
        name: 'Profit',
        data: [
            {
                x: 'Jan',
                y: 100
            },
            {
                x: 'Feb',
                y: 210
            },
            {
                x: 'Mar',
                y: 180
            },
            {
                x: 'Apr',
                y: 454
            },
            {
                x: 'May',
                y: 230
            },
            {
                x: 'Jun',
                y: 320
            },
            {
                x: 'Jul',
                y: 656
            },
            {
                x: 'Aug',
                y: 830
            },
            {
                x: 'Sep',
                y: 350
            },
            {
                x: 'Oct',
                y: 350
            },
            {
                x: 'Nov',
                y: 210
            },
            {
                x: 'Dec',
                y: 410
            }
        ]
    },
    {
        type: 'line',
        name: 'Revenue',
        data: [
            {
                x: 'Jan',
                y: 180
            },
            {
                x: 'Feb',
                y: 620
            },
            {
                x: 'Mar',
                y: 476
            },
            {
                x: 'Apr',
                y: 220
            },
            {
                x: 'May',
                y: 520
            },
            {
                x: 'Jun',
                y: 780
            },
            {
                x: 'Jul',
                y: 435
            },
            {
                x: 'Aug',
                y: 515
            },
            {
                x: 'Sep',
                y: 738
            },
            {
                x: 'Oct',
                y: 454
            },
            {
                x: 'Nov',
                y: 525
            },
            {
                x: 'Dec',
                y: 230
            }
        ]
    },
    {
        type: 'area',
        name: 'Sales',
        data: [
            {
                x: 'Jan',
                y: 200
            },
            {
                x: 'Feb',
                y: 530
            },
            {
                x: 'Mar',
                y: 110
            },
            {
                x: 'Apr',
                y: 130
            },
            {
                x: 'May',
                y: 480
            },
            {
                x: 'Jun',
                y: 520
            },
            {
                x: 'Jul',
                y: 780
            },
            {
                x: 'Aug',
                y: 435
            },
            {
                x: 'Sep',
                y: 475
            },
            {
                x: 'Oct',
                y: 738
            },
            {
                x: 'Nov',
                y: 454
            },
            {
                x: 'Dec',
                y: 480
            }
        ]
    }
]
export const Anaoptions:any = {
    chart: {
        height: 350,
        animations: {
            speed: 500
        },
        dropShadow: {
            enabled: true,
            enabledOnSeries: undefined,
            top: 8,
            left: 0,
            blur: 3,
            color: '#000',
            opacity: 0.1
        },
        toolbar : {
            show: false,
        },
        events: {
            mounted: (chart:any) => {
              chart.windowResizeHandler();
            }
          },
    },
    colors: ["rgb(132, 90, 223)", "rgba(35, 183, 229, 0.85)", "rgba(119, 119, 142, 0.05)"],
    dataLabels: {
        enabled: false
    },
    grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 3
    },
    stroke: {
        curve: 'smooth',
        width: [2, 2, 0],
        dashArray: [0, 5, 0],
    },
    xaxis: {
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        labels: {
            formatter: function (value: string) {
                return "$" + value;
            }
        },
    },
    tooltip: {
        y: [{
            formatter: function (e: number | undefined) {
                return void 0 !== e ? "$" + e.toFixed(0) : e;
            }
        }, {
            formatter: function (e: number | undefined) {
                return void 0 !== e ? "$" + e.toFixed(0) : e;
            }
        }, {
            formatter: function (e: number | undefined) {
                return void 0 !== e ? e.toFixed(0) : e;
            }
        }]
    },
    legend: {
        show: true,
        customLegendItems: ['Profit', 'Revenue', 'Sales'],
        inverseOrder: true
    },
    title: {
        text: 'Revenue Analytics with sales & profit (USD)',
        align: 'left',
        style: {
            fontSize: '.8125rem',
            fontWeight: 'semibold',
            color: '#8c9097'
        },
    },
    markers: {
        hover: {
            sizeOffset: 5
        }
    }
}
//***  Revenue Analytics--- End ***//


//***  Profit Earned--- Start ***//
export const Proseries = [{
    name: 'Profit Earned',
    data: [44, 42, 57, 86, 58, 55, 70],
}, {
    name: 'Total Sales',
    data: [34, 22, 37, 56, 21, 35, 60],
}]
export const Prooptions:any = {
    chart: {
        type: 'bar',
        height: 180,
        toolbar: {
            show: false,
        },
        events: {
            mounted: (chart:any) => {
              chart.windowResizeHandler();
            }
          },
    },
    grid: {
        borderColor: '#f1f1f1',
        strokeDashArray: 3
    },
    colors: ["rgb(132, 90, 223)", "#e4e7ed"],
    plotOptions: {
        bar: {
            colors: {
                ranges: [{
                    from: -100,
                    to: -46,
                    color: '#ebeff5'
                }, {
                    from: -45,
                    to: 0,
                    color: '#ebeff5'
                }]
            },
            columnWidth: '60%',
            borderRadius: 5,
        }
    },
    dataLabels: {
        enabled: false,
    },
    stroke: {
        show: true,
        width: 2,
        colors: undefined,
    },
    legend: {
        show: false,
        position: 'top',
    },
    yaxis: {
        title: {
            style: {
                color: '#adb5be',
                fontSize: '13px',
                fontFamily: 'poppins, sans-serif',
                fontWeight: 600,
                cssClass: 'apexcharts-yaxis-label',
            },
        },
        labels: {
            formatter: function (y: number) {
                return y.toFixed(0) + "";
            }
        }
    },
    xaxis: {
        categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        axisBorder: {
            show: true,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
        },
        axisTicks: {
            show: true,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0
        },
        labels: {
            rotate: -90
        }
    }
}
//***  Profit Earned--- End ***//


//***  Leads By Source--- Start ***//
export const Sourceseries = [32, 27, 25, 16]
export const Sourceoptions:any = {

    labels: ["Mobile","Desktop", "Laptop", "Tablet" ],
    chart: {
        events: {
            mounted: (chart:any) => {
              chart.windowResizeHandler();
            }
          },
        height: 250,
        type: 'donut'
    },
    dataLabels: {
        enabled: false,
    },

    legend: {
        show: false,
    },
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'round',
        colors: ["#fff"],
        width: 0,
        dashArray: 0,
    },
    plotOptions: {

        pie: {
            expandOnClick: false,
            donut: {
                size: '82%',
                labels: {
                    show: false,
                    name: {
                        show: true,
                        fontSize: '20px',
                        color: '#495057',
                        offsetY: -4
                    },
                    value: {
                        show: true,
                        fontSize: '18px',
                        color: undefined,
                        offsetY: 8,
                        formatter: function (val: string) {
                            return val + "%";
                        }
                    },

                }
            }
        }
    },
    colors: ["rgb(132, 90, 223)", "rgb(35, 183, 229)",  "rgb(245, 184, 73)", "rgb(38, 191, 148)",],
}
//***  Leads By Source--- End ***//


//***  Your target is incomplete--- Start ***//
export const Targetseries = ["48"]
export const Targetoptions:any = {
    chart: {
        height: 127,
        width: 100,
        type: "radialBar",
        events: {
            mounted: (chart:any) => {
              chart.windowResizeHandler();
            }
          },
    },
    colors: ["rgba(255,255,255,0.9)"],
    plotOptions: {
        radialBar: {
            hollow: {
                margin: 0,
                size: "55%",
                background: "#fff"
            },
            dataLabels: {
                name: {
                    offsetY: -10,
                    color: "#4b9bfa",
                    fontSize: ".625rem",
                    show: false
                },
                value: {
                    offsetY: 5,
                    color: "#4b9bfa",
                    fontSize: ".875rem",
                    show: true,
                    fontWeight: 600
                }
            }
        }
    },
    stroke: {
        lineCap: "round"
    },
    labels: ["Status"]
}
//***  Your target is incomplete--- End ***//

// Deals Statistics

export const Dealsstatistics = [
    { id: '1', src:face4, name: 'Mayor Kelly', role: 'Manufacture', mail: 'mayorkelly@gmail.com', location: 'Germany', date: 'Sep 15 - Oct 12, 2023', color: 'info', checked: '' },
    { id: '2', src:face15, name: 'Andrew Garfield', role: 'Development', mail: 'andrewgarfield@gmail.com', location: 'Canada', date: 'Apr 10 - Dec 12, 2023', color: 'primary', checked: 'defaultChecked' },
    { id: '3', src:face11, name: 'Simon Cowel', role: 'Service', mail: 'simoncowel234@gmail.com', location: 'Europe', date: 'Sep 15 - Oct 12, 2023', color: 'danger', checked: '' },
    { id: '4', src:face8, name: 'Mirinda Hers', role: 'Marketing', mail: 'mirindahers@gmail.com', location: 'USA', date: 'Apr 14 - Dec 14, 2023', color: 'warning', checked: 'defaultChecked' },
    { id: '5', src:face9, name: 'Jacob Smith', role: 'Social Plataform', mail: 'jacobsmith@gmail.com', location: 'Singapore', date: 'Feb 25 - Nov 25, 2023', color: 'success', checked: 'defaultChecked' },
];

 export const users = [
    { name: "Michael Jordan",class:'mb-[0.9rem]', text: "michael.jordan@example.com", balance: "$2,893", avatar: face10, spanclass:'',spantext:'' ,image:true},
    { name: "Emigo Kiaren",class:'mb-[0.9rem]', text: "emigo.kiaren@gmail.com", balance: "$4,289", initials: "EK", bgColor: "warning", spanclass:'!w-[1.75rem] !h-[1.75rem] leading-[1.75rem] text-[0.65rem]  rounded-full text-warning  bg-warning/10 font-semibold',spantext:'EK' ,image:false},
    { name: "Randy Origoan",class:'mb-[0.9rem]', text: "randy.origoan@gmail.com", balance: "$6,347", avatar: face12, spanclass:'',spantext:'' ,image:true},
    { name: "George Pieterson",class:'mb-[0.9rem]', text: "george.pieterson@gmail.com", balance: "$3,894", initials: "GP", bgColor: "success", spanclass:'!w-[1.75rem] !h-[1.75rem] leading-[1.75rem] text-[0.65rem]  rounded-full text-success bg-success/10 font-semibold',spantext:'GP' ,image:false},
    { name: "Kiara Advain",class:'', text: "kiaraadvain214@gmail.com", balance: "$2,679", initials: "KA", bgColor: "primary", spanclass:'!w-[1.75rem] !h-[1.75rem] leading-[1.75rem] text-[0.65rem]  rounded-full text-primary bg-primary/10 font-semibold',spantext:'KA' ,image:false},
]
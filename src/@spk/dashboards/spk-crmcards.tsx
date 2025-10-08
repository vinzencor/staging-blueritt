import  { Fragment, ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface SpkCrmCardsProps {
    chart?: ReactNode;      
    icon?: string;       
    title?: string;       
    chartid?: string;     
    ratio?: string | number; 
    text: string;        
    color?: string;   
}

const SpkCRMcards :React.FC<SpkCrmCardsProps>= ({chart, icon, title, text, color, ratio, chartid}) => {
  return (
    <Fragment>
    <div className="box overflow-hidden">
            <div className="box-body">
                <div className="flex items-top justify-between">
                <div>
                    <span
                    className={`!text-[0.8rem]  !w-[2.5rem] !h-[2.5rem] !leading-[2.5rem] !rounded-full inline-flex items-center justify-center bg-${color}`}>
                    <i className={`ti ti-${icon} text-[1rem] text-white`}></i>
                    </span>
                </div>
                <div className="flex-grow ms-4">
                    <div className="flex items-center justify-between flex-wrap">
                    <div>
                        <p className="text-[#8c9097] dark:text-white/50 text-[0.813rem] mb-0">{title}</p>
                        <h4 className="font-semibold  text-[1.5rem] !mb-2 ">{ratio}</h4>
                    </div>
                    <div id={chartid}>
                       {chart}
                    </div>
                    </div>
                    <div className="flex items-center justify-between !mt-1">
                    <div>
                        <Link className={`text-${color} text-[0.813rem]`} to="#">View All<i
                        className="ti ti-arrow-narrow-right ms-2 font-semibold inline-block"></i></Link>
                    </div>
                    <div className="text-end">
                        <p className={`mb-0 text-${text.includes("+")? "success" :"danger"} text-[0.813rem] font-semibold`}>{text}</p>
                        <p className="text-[#8c9097] dark:text-white/50 opacity-[0.7] text-[0.6875rem]">this month</p>
                    </div>
                    </div>
                </div>
                </div>
            </div>
    </div>
    </Fragment>
  )
}

export default SpkCRMcards
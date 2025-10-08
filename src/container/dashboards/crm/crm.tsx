
import  { FC, Fragment } from 'react'
import { Link } from 'react-router-dom';
import { Dealsstatistics ,Anaoptions, Anaseries, Coveroptions, Coverseries, Custoptions, Custseries, Dealoptions, Dealseries, Prooptions, Proseries, Revenueoptions, Revenueseries, Sourceoptions, Sourceseries, Targetoptions, Targetseries, users} from '../../../components/ui/data/dashboards/crmdata';
import ApexchartsComponent from '../../../@spk/spk-packages/apexcharts-component';
import SpkCRMcards from '../../../@spk/dashboards/spk-crmcards';
import SpkDropdown from '../../../@spk/uielements/spk-dropdown';
import Spktables from '../../../@spk/tables/spk-tables';
import SpkButton from '../../../@spk/uielements/spk-button';

interface CrmProps {}

const Crm: FC<CrmProps> = () => {

  return (
    <Fragment>
      <div className="md:flex block items-center justify-between my-[1.5rem] page-header-breadcrumb">
        <div>
          <p className="font-semibold text-[1.125rem] text-defaulttextcolor dark:text-defaulttextcolor/70 !mb-0">Welcome back, Json Taylor !</p>
          <p className="font-normal text-[#8c9097] dark:text-white/50 text-[0.813rem]">Track your sales activity, leads and deals here.</p>
        </div>
        <div className="btn-list md:mt-0 mt-2">
          <SpkButton buttontype="button" 
            customClass="ti-btn bg-primary text-white btn-wave !font-medium !me-[0.45rem] !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none">
            <i className="ri-filter-3-fill  inline-block"></i>Filters
          </SpkButton>
          <SpkButton buttontype="button" variant="outline-secondary"
            customClass="ti-btn btn-wave !font-medium  !me-[0.45rem]  !ms-0 !text-[0.85rem] !rounded-[0.35rem] !py-[0.51rem] !px-[0.86rem] shadow-none">
            <i className="ri-upload-cloud-line  inline-block"></i>Export
          </SpkButton>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-x-6">
        <div className="xxl:col-span-9 xl:col-span-12  col-span-12">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="xxl:col-span-4 xl:col-span-4  col-span-12">
              <div className="xxl:col-span-12 xl:col-span-12 col-span-12">
                <div className="box crm-highlight-card">
                  <div className="box-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[1.125rem] text-white mb-2">Your target is incomplete</div>
                        <span className="block text-[0.75rem] text-white"><span className="opacity-[0.7] text-nowrap me-1 rtl:ms-1">You have
                          completed</span>
                          <span className="font-semibold text-warning">48%</span> <span className="opacity-[0.7]">of the given
                            target, you can also check your status</span>.</span>
                        <span className="block font-semibold mt-[0.125rem]"><Link className="text-white text-[0.813rem]"
                          to="#"><u>Click
                            here</u></Link></span>
                      </div>
                      <div>
                        <div id="crm-main">
                          <ApexchartsComponent chartOptions={Targetoptions} chartSeries={Targetseries} type="radialBar" width={100} height={127} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="xxl:col-span-12 xl:col-span-12 col-span-12">
                <div className="box">
                  <div className="box-header flex justify-between">
                    <div className="box-title">
                      Top Deals
                    </div>
                    <SpkDropdown Icon={true} Linktag={true}  arialexpand={false} IconClass="fe fe-more-vertical text-[0.8rem]"
                      Linkclass="flex items-center justify-center w-[1.75rem] h-[1.75rem]  !text-[0.8rem] !py-1 !px-2 rounded-sm bg-light border-light shadow-none !font-medium"  >
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                          to="#">Week</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Month</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Year</Link></li>
                    </SpkDropdown>
                  </div>
                  <div className="box-body">
                    <ul className="list-none crm-top-deals mb-0">
                      {users.map((idx)=>(
                        <li className={idx.class} key={Math.random()}>
                          <div className="flex items-start flex-wrap">
                            <div className="me-2">
                              <span className={`inline-flex items-center justify-center ${idx.spanclass}`}>
                                {idx.image === true ?
                                  <img src={idx.avatar} alt=""
                                  className="w-[1.75rem] h-[1.75rem] leading-[1.75rem] text-[0.65rem]  rounded-full" />
                                  :""}
                                  {idx.spantext}
                              </span>
                            </div>
                            <div className="flex-grow">
                              <p className="font-semibold mb-[1.4px]  text-[0.813rem]">{idx.name}
                              </p>
                              <p className="text-[#8c9097] dark:text-white/50 text-[0.75rem]">{idx.text}</p>
                            </div>
                            <div className="font-semibold text-[0.9375rem] ">{idx.balance}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="xxl:col-span-12 xl:col-span-12 col-span-12">
                <div className="box">
                  <div className="box-header justify-between">
                    <div className="box-title">Profit Earned</div>
                    <SpkDropdown Icon={true} Linktag={true}  arialexpand={false}  IconClass="ri-arrow-down-s-line align-middle ms-1 inline-block"
                      Linkclass="px-2 font-normal text-[0.75rem] text-[#8c9097] dark:text-white/50"  Toggletext="View All">
                         <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                          to="#">Today</Link></li>
                        <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                          to="#">This Week</Link></li>
                        <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                          to="#">Last Week</Link></li>
                    </SpkDropdown>
                  </div>
                  <div className="box-body !py-0 !ps-0">
                    <div id="crm-profits-earned">
                        <ApexchartsComponent chartOptions={Prooptions} chartSeries={Proseries} type="bar" height={180} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xxl:col-span-8  xl:col-span-8  col-span-12">
              <div className="grid grid-cols-12 gap-x-6">
                <div className="xxl:col-span-6 xl:col-span-6 col-span-12">
                     <SpkCRMcards color="primary" title={"Total Customers"} ratio="1,02,890" icon="users" text="+40%" chartid="crm-total-customers" chart={<ApexchartsComponent chartOptions={Custoptions} chartSeries={Custseries} type="line" height={40} width={100} />} />
                </div>
                <div className="xxl:col-span-6 xl:col-span-6 col-span-12">
                    <SpkCRMcards color="secondary" title="Total Revenue" ratio="$56,562" icon="wallet" text="+25%" chartid="crm-total-revenue" chart={<ApexchartsComponent chartOptions={Revenueoptions} chartSeries={Revenueseries} type="line" height={40} width={100} />} />
                </div>
                <div className="xxl:col-span-6 xl:col-span-6 col-span-12">
                     <SpkCRMcards color="success" title="Conversion Ratio" ratio="12.08%" icon="wave-square" text="-12%" chartid="crm-conversion-ratio" chart={ <ApexchartsComponent chartOptions={Coveroptions} chartSeries={Coverseries} type="line" height={40} width={100} />} />
                </div>
                <div className="xxl:col-span-6 xl:col-span-6 col-span-12">
                    <SpkCRMcards color="warning" title="Total Deals" ratio="2,543" icon="briefcase" text="+19%" chartid="crm-total-deals" chart={ <ApexchartsComponent chartOptions={Dealoptions} chartSeries={Dealseries} type="line" height={40} width={100} />} />
                </div>
                <div className="xxl:col-span-12 xl:col-span-12 col-span-12">
                  <div className="box">
                    <div className="box-header !gap-0 !m-0 justify-between">
                      <div className="box-title">
                        Revenue Analytics
                      </div>
                      <SpkDropdown Icon={true} Linktag={true}  arialexpand={false}  IconClass="ri-arrow-down-s-line align-middle ms-1 inline-block"
                        Linkclass="px-2 font-normal text-[0.75rem] text-[#8c9097] dark:text-white/50"  Toggletext="View All">
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Today</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">This Week</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Last Week</Link></li>
                      </SpkDropdown>
                    </div>
                    <div className="box-body !py-5">
                      <div id="crm-revenue-analytics">
                           <ApexchartsComponent chartOptions={Anaoptions} chartSeries={Anaseries} type="line" height={350} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xxl:col-span-12 xl:col-span-12 col-span-12">
              <div className="box custom-card">
                <div className="box-header justify-between">
                  <div className="box-title">
                    Deals Statistics
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div>
                      <input className="ti-form-control form-control-sm" type="text" placeholder="Search Here"
                        aria-label=".form-control-sm example" />
                    </div>
                      <SpkDropdown Icon={true} Linktag={true}  arialexpand={false}  IconClass="ri-arrow-down-s-line align-middle ms-1 inline-block"
                          Linkclass="ti-btn ti-btn-primary !bg-primary !text-white !py-1 !px-2 !text-[0.75rem] !m-0 !gap-0 !font-medium"  Toggletext="Sort By">
                           <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">New</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Popular</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Relevant</Link></li>
                      </SpkDropdown>
                  </div>
                </div>
                <div className="box-body">
                  <div className="overflow-x-auto">
                    <Spktables tableClass="table min-w-full whitespace-nowrap table-hover border table-bordered" showCheckbox={true} Customcheckclass="!ps-4 !pe-5"
                     header={[{ title: 'Sales Rep' , headerClassname:'!text-start !text-[0.85rem] min-w-[200px]'}, { title: 'Category', headerClassname:'text-start !text-[0.85rem]' }, { title: 'Mail' , headerClassname:'text-start !text-[0.85rem]'}, 
                     { title: 'Location' , headerClassname:'text-start !text-[0.85rem]'}, { title: 'Date', headerClassname:'text-start !text-[0.85rem]' }, { title: 'Action', headerClassname:'text-start !text-[0.85rem]' }]}>
                        {Dealsstatistics.map((idx) => (
                          <tr className="border border-inherit border-solid hover:bg-gray-100 dark:border-defaultborder/10 dark:hover:bg-light" key={Math.random()}>
                            <th scope="row" className="!ps-4 !pe-5"><input className="form-check-input" type="checkbox" defaultChecked={idx.checked === 'defaultChecked'}
                               defaultValue="" aria-label="..." /></th>
                            <td>
                              <div className="flex items-center font-semibold">
                                <span className="!me-2 inline-flex justify-center items-center">
                                  <img src={idx.src} alt="img"
                                    className="w-[1.75rem] h-[1.75rem] leading-[1.75rem] text-[0.65rem]  rounded-full" />
                                </span>{idx.name}
                              </div>
                            </td>
                            <td>{idx.role}</td>
                            <td>{idx.mail}</td>
                            <td>
                              <span
                                className={`inline-flex text-${idx.color} !py-[0.15rem] !px-[0.45rem] rounded-sm !font-semibold !text-[0.75em] bg-${idx.color}/10`}>{idx.location}</span>
                            </td>
                            <td>{idx.date}</td>
                            <td>
                              <div className="flex flex-row items-center !gap-2 text-[0.9375rem]">
                                <Link aria-label="anchor" to="#"
                                  className="ti-btn ti-btn-icon ti-btn-wave !gap-0 !m-0 !h-[1.75rem] !w-[1.75rem] text-[0.8rem] bg-success/10 text-success hover:bg-success hover:text-white hover:border-success"><i
                                    className="ri-download-2-line"></i></Link>
                                <Link aria-label="anchor" to="#"
                                  className="ti-btn ti-btn-icon ti-btn-wave !gap-0 !m-0 !h-[1.75rem] !w-[1.75rem] text-[0.8rem] bg-primary/10 text-primary hover:bg-primary hover:text-white hover:border-primary"><i
                                    className="ri-edit-line"></i></Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </Spktables>
                  </div>
                </div>
                <div className="box-footer">
                  <div className="sm:flex items-center">
                    <div className="text-defaulttextcolor dark:text-defaulttextcolor/70">
                      Showing 5 Entries <i className="bi bi-arrow-right ms-2 font-semibold"></i>
                    </div>
                    <div className="ms-auto">
                      <nav aria-label="Page navigation" className="pagination-style-4">
                        <ul className="ti-pagination mb-0">
                          <li className="page-item disabled">
                            <Link className="page-link" to="#">
                              Prev
                            </Link>
                          </li>
                          <li className="page-item"><Link className="page-link active" to="#">1</Link></li>
                          <li className="page-item"><Link className="page-link" to="#">2</Link></li>
                          <li className="page-item">
                            <Link className="page-link !text-primary" to="#">
                              next
                            </Link>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="xxl:col-span-3 xl:col-span-12 col-span-12">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="xxl:col-span-12 xl:col-span-12  col-span-12">
              <div className="box">
                <div className="box-header justify-between">
                  <div className="box-title">
                    Leads By Source
                  </div>
                    <SpkDropdown Icon={true} Linktag={true}  arialexpand={false}  IconClass="fe fe-more-vertical text-[0.8rem]"
                          Linkclass="flex items-center justify-center w-[1.75rem] h-[1.75rem] ! !text-[0.8rem] !py-1 !px-2 rounded-sm bg-light border-light shadow-none !font-medium" >
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Week</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Month</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Year</Link></li>
                    </SpkDropdown>
                </div>
                <div className="box-body overflow-hidden">
                  <div className="leads-source-chart flex items-center justify-center">
                      <ApexchartsComponent chartOptions={Sourceoptions} chartSeries={Sourceseries} type="donut" height={250} />
                    <div className="lead-source-value ">
                      <span className="block text-[0.875rem] ">Total</span>
                      <span className="block text-[1.5625rem] font-bold">4,145</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 border-t border-dashed dark:border-defaultborder/10">
                  <div className="col !p-0">
                    <div className="!ps-4 p-[0.95rem] text-center border-e border-dashed dark:border-defaultborder/10">
                      <span className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-1 crm-lead-legend mobile inline-block">Mobile
                      </span>
                      <div><span className="text-[1rem]  font-semibold">1,624</span>
                      </div>
                    </div>
                  </div>
                  <div className="col !p-0">
                    <div className="p-[0.95rem] text-center border-e border-dashed dark:border-defaultborder/10">
                      <span className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-1 crm-lead-legend desktop inline-block">Desktop
                      </span>
                      <div><span className="text-[1rem]  font-semibold">1,267</span></div>
                    </div>
                  </div>
                  <div className="col !p-0">
                    <div className="p-[0.95rem] text-center border-e border-dashed dark:border-defaultborder/10">
                      <span className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-1 crm-lead-legend laptop inline-block">Laptop
                      </span>
                      <div><span className="text-[1rem]  font-semibold">1,153</span>
                      </div>
                    </div>
                  </div>
                  <div className="col !p-0">
                    <div className="!pe-4 p-[0.95rem] text-center">
                      <span className="text-[#8c9097] dark:text-white/50 text-[0.75rem] mb-1 crm-lead-legend tablet inline-block">Tablet
                      </span>
                      <div><span className="text-[1rem]  font-semibold">679</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="xxl:col-span-12 xl:col-span-6  col-span-12">
              <div className="box">
                <div className="box-header justify-between">
                  <div className="box-title">
                    Deals Status
                  </div>
                  <SpkDropdown Icon={true} Linktag={true}  arialexpand={false}  IconClass="ri-arrow-down-s-line align-middle ms-1 inline-block" Toggletext="View All"
                     Linkclass="text-[0.75rem] px-2 font-normal text-[#8c9097] dark:text-white/50">
                        <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                          to="#">Today</Link></li>
                        <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                          to="#">This Week</Link></li>
                        <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                          to="#">Last Week</Link></li>
                  </SpkDropdown>
                </div>
                <div className="box-body">
                  <div className="flex items-center mb-[0.8rem]">
                    <h4 className="font-bold mb-0 text-[1.5rem] ">4,289</h4>
                    <div className="ms-2">
                      <span
                        className="py-[0.18rem] px-[0.45rem] rounded-sm text-success !font-medium !text-[0.75em] bg-success/10">1.02<i
                          className="ri-arrow-up-s-fill align-mmiddle ms-1"></i></span>
                      <span className="text-[#8c9097] dark:text-white/50 text-[0.813rem] ms-1">compared to last week</span>
                    </div>
                  </div>

                  <div className="flex w-full h-[0.3125rem] mb-6 rounded-full overflow-hidden">
                    <div className="flex flex-col justify-center rounded-s-[0.625rem] overflow-hidden bg-primary w-[21%]" aria-valuenow={21} aria-valuemin={0} aria-valuemax={100}>
                    </div>
                    <div className="flex flex-col justify-center rounded-none overflow-hidden bg-info w-[26%]" aria-valuenow={26} aria-valuemin={0} aria-valuemax={100}>
                    </div>
                    <div className="flex flex-col justify-center rounded-none overflow-hidden bg-warning w-[35%]"  aria-valuenow={35} aria-valuemin={0} aria-valuemax={100}>
                    </div>
                    <div className="flex flex-col justify-center rounded-e-[0.625rem] overflow-hidden bg-success w-[18%]" aria-valuenow={18} aria-valuemin={0} aria-valuemax={100}>
                    </div>
                  </div>
                  <ul className="list-none mb-0 pt-2 crm-deals-status">
                    <li className="primary">
                      <div className="flex items-center text-[0.813rem]  justify-between">
                        <div>Successful Deals</div>
                        <div className="text-[0.75rem] text-[#8c9097] dark:text-white/50">987 deals</div>
                      </div>
                    </li>
                    <li className="info">
                      <div className="flex items-center text-[0.813rem]  justify-between">
                        <div>Pending Deals</div>
                        <div className="text-[0.75rem] text-[#8c9097] dark:text-white/50">1,073 deals</div>
                      </div>
                    </li>
                    <li className="warning">
                      <div className="flex items-center text-[0.813rem]  justify-between">
                        <div>Rejected Deals</div>
                        <div className="text-[0.75rem] text-[#8c9097] dark:text-white/50">1,674 deals</div>
                      </div>
                    </li>
                    <li className="success">
                      <div className="flex items-center text-[0.813rem]  justify-between">
                        <div>Upcoming Deals</div>
                        <div className="text-[0.75rem] text-[#8c9097] dark:text-white/50">921 deals</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="xxl:col-span-12 xl:col-span-6  col-span-12">
              <div className="box">
                <div className="box-header justify-between">
                  <div className="box-title">
                    Recent Activity
                  </div>
                  <SpkDropdown Icon={true} Linktag={true}  arialexpand={false} Customclass="py-1"  Toggletext="View All"
                      Linkclass="text-[0.75rem] px-2 font-normal text-[#8c9097] dark:text-white/50"  IconClass="ri-arrow-down-s-line align-middle ms-1 inline-block">
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Today</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">This Week</Link></li>
                          <li><Link className="ti-dropdown-item !py-2 !px-[0.9375rem] !text-[0.8125rem] !font-medium block"
                            to="#">Last Week</Link></li>
                    </SpkDropdown>
                </div>
                <div className="box-body">
                  <div>
                    <ul className="list-none mb-0 crm-recent-activity">
                      <li className="crm-recent-activity-content">
                        <div className="flex items-start">
                          <div className="me-4">
                            <span
                              className="w-[1.25rem] h-[1.25rem] inline-flex items-center justify-center font-medium leading-[1.25rem] text-[0.65rem] text-primary bg-primary/10 rounded-full">
                              <i className="bi bi-circle-fill text-[0.5rem]"></i>
                            </span>
                          </div>
                          <div className="crm-timeline-content text-defaultsize">
                            <span className="font-semibold rtl:ms-1">Update of calendar events
                              &amp;</span><span><Link to="#" className="text-primary font-semibold ms-1">
                                Added new events in next week.</Link></span>
                          </div>
                          <div className="flex-grow text-end">
                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.6875rem] opacity-[0.7]">4:45PM</span>
                          </div>
                        </div>
                      </li>
                      <li className="crm-recent-activity-content">
                        <div className="flex items-start  text-defaultsize">
                          <div className="me-4">
                            <span
                              className="w-[1.25rem] h-[1.25rem] leading-[1.25rem] inline-flex items-center justify-center font-medium text-[0.65rem] text-secondary bg-secondary/10 rounded-full">
                              <i className="bi bi-circle-fill text-[0.5rem]"></i>
                            </span>
                          </div>
                          <div className="crm-timeline-content">
                            <span>New theme for <span className="font-semibold">Spruko Website</span> completed</span>
                            <span className="block text-[0.75rem] text-[#8c9097] dark:text-white/50">Lorem ipsum, dolor sit amet.</span>
                          </div>
                          <div className="flex-grow text-end">
                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.6875rem] opacity-[0.7]">3 hrs</span>
                          </div>
                        </div>
                      </li>
                      <li className="crm-recent-activity-content  text-defaultsize">
                        <div className="flex items-start">
                          <div className="me-4">
                            <span
                              className="w-[1.25rem] h-[1.25rem] leading-[1.25rem] inline-flex items-center justify-center font-medium text-[0.65rem] text-success bg-success/10 rounded-full">
                              <i className="bi bi-circle-fill  text-[0.5rem]"></i>
                            </span>
                          </div>
                          <div className="crm-timeline-content">
                            <span>Created a <span className="text-success font-semibold">New Task</span> today <span
                              className="w-[1.25rem] h-[1.25rem] leading-[1.25rem] text-[0.65rem] inline-flex items-center justify-center font-medium bg-purplemain/10 rounded-full ms-1"><i
                                className="ri-add-fill text-purplemain text-[0.75rem]"></i></span></span>
                          </div>
                          <div className="flex-grow text-end">
                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.6875rem] opacity-[0.7]">22 hrs</span>
                          </div>
                        </div>
                      </li>
                      <li className="crm-recent-activity-content  text-defaultsize">
                        <div className="flex items-start">
                          <div className="me-4">
                            <span
                              className="w-[1.25rem] h-[1.25rem] leading-[1.25rem] inline-flex items-center justify-center font-medium text-[0.65rem] text-pinkmain bg-pinkmain/10 rounded-full">
                              <i className="bi bi-circle-fill text-[0.5rem]"></i>
                            </span>
                          </div>
                          <div className="crm-timeline-content">
                            <span>New member <span
                              className="py-[0.2rem] px-[0.45rem] font-semibold rounded-sm text-pinkmain text-[0.75em] bg-pinkmain/10">@andreas
                              gurrero</span> added today to AI Summit.</span>
                          </div>
                          <div className="flex-grow text-end">
                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.6875rem] opacity-[0.7]">Today</span>
                          </div>
                        </div>
                      </li>
                      <li className="crm-recent-activity-content  text-defaultsize">
                        <div className="flex items-start">
                          <div className="me-4">
                            <span
                              className="w-[1.25rem] h-[1.25rem] leading-[1.25rem] inline-flex items-center justify-center font-medium text-[0.65rem] text-warning bg-warning/10 rounded-full">
                              <i className="bi bi-circle-fill text-[0.5rem]"></i>
                            </span>
                          </div>
                          <div className="crm-timeline-content">
                            <span>32 New people joined summit.</span>
                          </div>
                          <div className="flex-grow text-end">
                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.6875rem] opacity-[0.7]">22 hrs</span>
                          </div>
                        </div>
                      </li>
                      <li className="crm-recent-activity-content  text-defaultsize">
                        <div className="flex items-start">
                          <div className="me-4">
                            <span
                              className="w-[1.25rem] h-[1.25rem] leading-[1.25rem] inline-flex items-center justify-center font-medium text-[0.65rem] text-info bg-info/10 rounded-full">
                              <i className="bi bi-circle-fill text-[0.5rem]"></i>
                            </span>
                          </div>
                          <div className="crm-timeline-content">
                            <span>Neon Tarly added <span className="text-info font-semibold">Robert Bright</span> to AI
                              summit project.</span>
                          </div>
                          <div className="flex-grow text-end">
                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.6875rem] opacity-[0.7]">12 hrs</span>
                          </div>
                        </div>
                      </li>
                      <li className="crm-recent-activity-content  text-defaultsize">
                        <div className="flex items-start">
                          <div className="me-4">
                            <span
                              className="w-[1.25rem] h-[1.25rem] leading-[1.25rem] inline-flex items-center justify-center font-medium text-[0.65rem] text-[#232323] dark:text-white bg-[#232323]/10 dark:bg-white/20 rounded-full">
                              <i className="bi bi-circle-fill text-[0.5rem]"></i>
                            </span>
                          </div>
                          <div className="crm-timeline-content">
                            <span>Replied to new support request <i
                              className="ri-checkbox-circle-line text-success text-[1rem] align-middle"></i></span>
                          </div>
                          <div className="flex-grow text-end">
                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.6875rem] opacity-[0.7]">4 hrs</span>
                          </div>
                        </div>
                      </li>
                      <li className="crm-recent-activity-content  text-defaultsize">
                        <div className="flex items-start">
                          <div className="me-4">
                            <span
                              className="w-[1.25rem] h-[1.25rem] leading-[1.25rem] inline-flex items-center justify-center font-medium text-[0.65rem] text-purplemain bg-purplemain/10 rounded-full">
                              <i className="bi bi-circle-fill text-[0.5rem]"></i>
                            </span>
                          </div>
                          <div className="crm-timeline-content">
                            <span>Completed documentation of <Link to="#"
                              className="text-purplemain underline font-semibold">AI Summit.</Link></span>
                          </div>
                          <div className="flex-grow text-end">
                            <span className="block text-[#8c9097] dark:text-white/50 text-[0.6875rem] opacity-[0.7]">4 hrs</span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
export default Crm;
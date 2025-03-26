import React, { useEffect, useState } from 'react'
import { F_CreditIcon, F_DebitIcon, F_TotalBalanceIcon } from "../../Icons";
import UtilLocalService, { notify } from '../../utils/localServiceUtil';
import Next10Days from './Next10Days';
import DebitvsCredit from './DebitvsCredit';
import TotalBalance from './TotalBalance';
import { BASE_URL } from '../../constanats';
import { callAPI } from '../../utils/api';
import { useSelector } from 'react-redux';
import TodayReminder from './TodayReminder';
import UserBarChart from './UserBarChart';
import MultiLineChart from './MultiLineChart';

const Dashboard = () => {
  const [finalHeight, setFinalHeight] = useState("");
  const selectedCompany = {}
  const [filter, setFilter] = useState({})
  const [data, setData] = useState('')
  const [sessionData, setSessionData] = useState('')

  useEffect(() => {
    let mainLayoutHeader = document.getElementById("f_layout-content-header");
    let mainHeight = mainLayoutHeader?.offsetHeight;
    setFinalHeight(mainHeight);
  }, [window?.location?.pathname]);

  useEffect(() => {
    if (selectedCompany?._id) {
      setFilter((prevFilter) => ({
        ...prevFilter,      // Use the most recent value of filter
        fileId: selectedCompany?._id
      }));
    }
  }, [selectedCompany]);

  const fetchData = () => {
      callAPI("GET", `${BASE_URL}/admin/player/getPlayerCounts`)
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          notify("error", err.message);
        });
    }

    const fetchCountData = () => {
      callAPI("GET", `${BASE_URL}/admin/thirdGame/session/getSessionCounts`)
        .then((res) => {
          setSessionData(res);
        })
        .catch((err) => {
          notify("error", err.message);
        });
    }

  useEffect(() => {
    fetchCountData();
      fetchData();
  }, [filter])

  return (
    <React.Fragment>
      <div className="f_content-main-inner" style={{ height: `calc(100vh - ${finalHeight}px)` }}>
        <div className='f_dashboard'>
          <div className='f_row f_m-0'>
            <div className='f_col-12'>
              <div className='f_row f_m-0'>
                <div className='f_mb-20 f_col-3 f_pl-10 f_pr-10'>
                  <div className='f_dashboard-overview'>
                    <div className='f_dashboard-overview-icon'>
                      <F_DebitIcon width='20px' height='20px' fill='#D1293D' />
                    </div>
                    <div className='f_dashboard-overview-content'>
                      <h6 className='f_color-error-500'>{data?.totalCount || 0}</h6>
                      <p>Total Users</p>
                    </div>
                  </div>
                </div>
                <div className='f_col-3 f_pl-10 f_pr-10 f_mb-20'>
                  <div className='f_dashboard-overview'>
                    <div className='f_dashboard-overview-icon' style={{ background: '#E1F0E8' }}>
                      <F_CreditIcon fill='#359766' width='20px' height='20px' />
                    </div>
                    <div className='f_dashboard-overview-content'>
                      <h6 className='f_color-success-500'>{sessionData?.totalCounts?.firstGame + sessionData?.totalCounts?.secondGame + sessionData?.totalCounts?.thirdGame || 0}</h6>
                      <p>Total Game playes</p>
                    </div>
                  </div>
                </div>
                <div className='f_col-2 f_pl-10 f_pr-10 f_mb-20'>
                  <div className='f_dashboard-overview'>
                    <div className='f_dashboard-overview-icon' style={{ background: '#EEEDFD' }}>
                      <F_TotalBalanceIcon stroke='#8F85F3' width='20px' height='20px' />
                    </div>
                    <div className='f_dashboard-overview-content'>
                      <h6 className='f_color-primary-500'>{sessionData?.totalCounts?.firstGame || 0}</h6>
                      <p>firstGame</p>
                    </div>
                  </div>
                </div>
                <div className='f_col-2 f_pl-10 f_pr-10 f_mb-20'>
                  <div className='f_dashboard-overview'>
                    <div className='f_dashboard-overview-icon' style={{ background: '#EEEDFD' }}>
                      <F_TotalBalanceIcon stroke='#8F85F3' width='20px' height='20px' />
                    </div>
                    <div className='f_dashboard-overview-content'>
                      <h6 className='f_color-primary-500'>{sessionData?.totalCounts?.secondGame  || 0}</h6>
                      <p>secondGame</p>
                    </div>
                  </div>
                </div>
                <div className='f_col-2 f_pl-10 f_pr-10 f_mb-20'>
                  <div className='f_dashboard-overview'>
                    <div className='f_dashboard-overview-icon' style={{ background: '#EEEDFD' }}>
                      <F_TotalBalanceIcon stroke='#8F85F3' width='20px' height='20px' />
                    </div>
                    <div className='f_dashboard-overview-content'>
                      <h6 className='f_color-primary-500'>{sessionData?.totalCounts?.thirdGame || 0}</h6>
                      <p>ThirdGame</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className='f_row f_m-0'>
                <div className='f_w-100 f_pl-10 f_pr-10 f_mb-20'>
                  <DebitvsCredit />
                </div>
                <div className='f_w-100 f_pl-10 f_pr-10 f_mb-20'>
                  <TotalBalance />
                </div>
              </div> */}
            </div>
            <div className='f_col-12'>
              <div className='f_row f_m-0'>
                <div className='f_col-6 f_pl-10 f_pr-10 f_mb-20'>
                  <UserBarChart data={data?.data || []}/>
                </div>
                <div className='f_col-6 f_pl-10 f_pr-10 f_mb-20'>
                  <MultiLineChart data={sessionData?.monthlyData || []}/>
                </div>
                {/* <div className='f_col-4 f_pl-10 f_pr-10 f_mb-20'>
                  <Next10Days />
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

    </React.Fragment>
  )
}

export default Dashboard
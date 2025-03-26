import React, { useEffect, useState } from 'react'
import { F_DownloadExcelIcon, F_DownloadPdfIcon, F_FilterIcon, F_RightArrowIcon } from '../../Icons'
import { Checkbox, Popover, Table, Tooltip } from 'antd'
import { callAPI } from '../../utils/api';
import { useSelector } from 'react-redux';
import { BASE_URL, TOKEN_KEY } from '../../constanats';
import UtilLocalService, { notify } from '../../utils/localServiceUtil';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import { render } from '@testing-library/react';

const TodayReminder = () => {
  const [data, setData] = React.useState('');
  const selectedCompany = {}
  const [filter, setFilter] = useState({
    page: 1,
    limit: 20,
  })
  const [counts, setCounts] = useState('')
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedCompany?._id) {
      const today = moment().format("YYYY-MM-DD");
      setFilter((prevFilter) => ({
        ...prevFilter,
        filter: {
          fileId: selectedCompany._id,
          reminderDate: {
            startDate: today,
            endDate: today,
          },
        },
      }));
    }
  }, [selectedCompany]);

  const fetchData = () => {
    const body = { ...filter }
    callAPI("POST", `${BASE_URL}/user/payment/paginate`, body)
      .then((res) => {
        setData(res.data.list);
        setCounts(res?.data?.totals)
      })
      .catch((err) => {
        notify("error", "Failed to fetch data", err.message);
      });
  }

  useEffect(() => {
    if (selectedCompany && filter?.filter) {
      fetchData();
    }
  }, [filter])

  const companyList = [
    {
      title: 'Sr. No.',
      id: "row",
      key: "row",
      dataIndex: 'key',
      width: "5%",
      render: (x, props, index) => (
        <span>{index + 1}</span>
      )
    },
    {
      title: 'House No.',
      dataIndex: 'partyId',
      id: 'houseNumber',
      key: 'houseNumber',
      render: (x) => x?.houseNumber
    },
    {
      title: 'Reminder Date',
      dataIndex: 'reminderDate',
      id: 'reminderDate',
      key: 'reminderDate',
      render: (reminderDate) => moment(reminderDate).format("DD-MM-YYYY")
    },
    {
      title: 'Party Name',
      dataIndex: 'partyId',
      id: 'ownerName',
      key: 'ownerName',
      render: (owner) => owner && owner?.ownerName || "-"
    },
    {
      title: 'Mobile No.',
      dataIndex: 'partyId',
      id: 'mobielNo',
      key: 'mobielNo',
      render: (owner) => owner && owner?.mobileNumber || "-"
    },
    // {
    //   title: 'Total Payment',
    //   dataIndex: 'partyId',
    //   id: 'totalPayment',
    //   key: 'totalPayment',
    //   render: (owner) => owner && owner?.payment || "-"
    // },
    // {
    //   title: 'Down Payment',
    //   dataIndex: 'partyId',
    //   id: 'downPayment',
    //   key: 'downPayment',
    //   render: (owner) => owner && owner?.downPayment || "-"
    // },
    {
      title: 'Collecting Payment',
      dataIndex: 'payment',
      id: 'collectingPayment',
      key: 'collectingPayment',
    },
    // {
    //   title: <div className='f_flex f_align-center f_content-center'><span>EMI Type</span></div>,
    //   dataIndex: 'emiType',
    //   className: 'f_text-center',
    //   id: 'emiType',
    //   key: 'emiType',
    //   render: (emiType) => {
    //     return emiType == 2 ? "Master" : "Regular";
    //   }
    // },
  ]

  const downloadFile = async (isPdf = false) => {
    let url = !isPdf ? 'download-xls' : 'download-pdf';
    axios
      .post(`${BASE_URL}/user/payment/reminder/${url}`, filter, {
        responseType: "arraybuffer",
        headers: {
          Authorization: "Bearer " + UtilLocalService.getLocalStorage(TOKEN_KEY),
        },
      })
      .then((response) => {
        var blob = new Blob([response.data], {
          type: isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", isPdf ? "Reminder.pdf" : "Reminder.xlsx");
        document.body.appendChild(link);
        link.click();
      });
  };

  return (
    <React.Fragment>
      <div className='f_dashboard-bg'>
        <div className='f_dashboard-header f_flex f_align-center f_content-between'>
          <div className='f_flex f_align-center'>
            <h6 className='f_mr-5'>Users </h6>
            {/* <Popover placement="bottom" overlayClassName="f_common-popover" content={handleFilterMonthPopover()} trigger="click">
                            <Tooltip title="Filter" placement='top'><span className='f_cp f_flex f_align-center f_content-center f_rollover-icon'><F_FilterIcon width='14px' height='14px' /></span></Tooltip>
                        </Popover> */}
          </div>
          <div className='f_flex f_align-center f_content-end'>
            <div className='f_ml-10'>
              <Tooltip title="Download PDF" placement='bottom'><span className='f_flex f_align-center f_content-center f_cp f_rollover-icon' onClick={() => downloadFile(true)}><F_DownloadPdfIcon width='14px' height='14px' /></span></Tooltip>
            </div>
            <div className='f_ml-10'>
              <Tooltip title="Download Excel" placement='bottom'><span className='f_flex f_align-center f_content-center f_cp f_rollover-icon' onClick={() => downloadFile()}><F_DownloadExcelIcon width='14px' height='14px' /></span></Tooltip>
            </div>
            <div className='f_ml-10'>
              <Tooltip title="View" placement='bottom'><span className='f_flex f_align-center f_content-center f_cp f_rollover-icon' onClick={() => navigate('/reminder')}><F_RightArrowIcon width='14px' height='14px' /></span></Tooltip>
            </div>
          </div>
        </div>
        <div className='f_dashboard-content'>
          
        </div>
      </div>
    </React.Fragment>
  )
}

export default TodayReminder
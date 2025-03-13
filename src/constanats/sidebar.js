import React from "react";
import { F_BankCashIcon, F_BankingIcon, F_CompanyIcon, F_DashboardIcon, F_MultiUserIcon, F_NotificationIcon, F_ReportLedgerIcon } from "../Icons";

export const USER_SIDEBAR_MENU = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        icon: (
            <React.Fragment>
                <F_DashboardIcon width="18px" height="18px" />
            </React.Fragment>
        ),
    },
    {
        path: '/contacts',
        name: 'Users',
        icon: (
            <React.Fragment>
                <F_MultiUserIcon width="18px" height="18px" />
            </React.Fragment>
        ),
    },
    {
        path: '/firstGame',
        name: 'Game1',
        icon: (
            <React.Fragment>
                <F_CompanyIcon width="18px" height="18px" />
            </React.Fragment>
        ),
    },
    {
        path: '/secondGame',
        name: 'Game2',
        icon: (
            <React.Fragment>
                <F_CompanyIcon width="18px" height="18px" />
            </React.Fragment>
        ),
    },
    {
        path: '/thirdGame',
        name: 'Game3',
        icon: (
            <React.Fragment>
                <F_CompanyIcon width="18px" height="18px" />
            </React.Fragment>
        ),
    },
]
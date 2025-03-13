import Dashboard from "../containers/Dashboard";
import Contacts from "../containers/Contacts";
import Partner from "../containers/Partner";
import SecondGame from "../containers/SecondGame";
import ThirdGame from "../containers/ThirdGame";

export const ROUTES = [
    {
        path: '/dashboard',
        component: Dashboard
    },
    {
        path: '/contacts',
        component: Contacts
    },
    {
        path: '/firstGame',
        component: Partner
    },
    {
        path: '/secondGame',
        component: SecondGame
    },
    {
        path: '/thirdGame',
        component: ThirdGame
    },
]
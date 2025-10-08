// import SpkBadge from "../../../@spk/uielements/spk-badge";

const DashboardIcon = <i className="bx bx-home side-menu__icon"></i>;
const ExplorerIcon = <i className="bx bx-cube side-menu__icon"></i>;
const ProfitProIcon = <i className="bx bx-calculator side-menu__icon"></i>;
const SocialIcon = <i className="bx bx-share-alt side-menu__icon"></i>;
const AIIcon = <i className="bx bx-brain side-menu__icon"></i>;
const MyListingsIcon = <i className="bx bx-list-ul side-menu__icon"></i>;
const ThirdPartyIcon = <i className="bx bx-link side-menu__icon"></i>;
const SettingsIcon = <i className="bx bx-cog side-menu__icon"></i>;
const support = <i className="las la-headphones side-menu__icon"></i>;
const logoutIcon = <i className="ti ti-logout side-menu__icon"></i>;
// const ErrorIcon = <i className="bx bx-error side-menu__icon"></i>;

// const NestedmenuIcon = <i className="bx bx-layer side-menu__icon"></i>;

// const badge = (
//   <SpkBadge customClass="!bg-warning/10 !text-warning !py-[0.25rem] !px-[0.45rem] !text-[0.75em] ms-1">
//     12
//   </SpkBadge>
// );

// export const MenuItems: any = [
//   {
//     menutitle: "MAIN",
//   },

//   {
//     icon: DashboardIcon,
//     badgetxt: badge,
//     title: "Dashboards",
//     type: "sub",
//     active: false,
//     selected: false,
//     children: [
//       {
//         path: `${import.meta.env.BASE_URL}dashboards/crm`,
//         type: "link",
//         active: false,
//         selected: false,
//         dirchange: false,
//         title: "CRM",
//       },
//     ],
//   },

//   {
//     icon: ErrorIcon,
//     title: "Error",
//     type: "sub",
//     active: false,
//     selected: false,
//     dirchange: false,
//     children: [
//       {
//         path: `${import.meta.env.BASE_URL}error/error-401`,
//         type: "link",
//         active: false,
//         selected: false,
//         dirchange: false,
//         title: "401-Error",
//       },
//       {
//         path: `${import.meta.env.BASE_URL}error/error-404`,
//         type: "link",
//         active: false,
//         selected: false,
//         dirchange: false,
//         title: "404-Error",
//       },
//       {
//         path: `${import.meta.env.BASE_URL}error/error-500`,
//         type: "link",
//         active: false,
//         selected: false,
//         dirchange: false,
//         title: "500-Error",
//       },
//     ],
//   },
//   {
//     menutitle: "WEB APPS",
//   },
//   {
//     icon: NestedmenuIcon,
//     title: "Nested Menu",
//     selected: false,
//     active: false,
//     type: "sub",
//     children: [
//       {
//         path: "",
//         title: "Nested-1",
//         type: "empty",
//         active: false,
//         selected: false,
//         dirchange: false,
//       },

//       {
//         title: "Nested-2",
//         type: "sub",
//         active: false,
//         selected: false,
//         dirchange: false,
//         children: [
//           {
//             path: "",
//             type: "empty",
//             active: false,
//             selected: false,
//             dirchange: false,
//             title: "Nested-2-1",
//           },
//           {
//             path: "",
//             type: "empty",
//             ctive: false,
//             selected: false,
//             dirchange: false,
//             title: "Nested-2-2",
//           },
//           {
//             path: "",
//             type: "empty",
//             active: false,
//             selected: false,
//             dirchange: false,
//             title: "Nested-2-3",
//           },
//         ],
//       },
//     ],
//   },

// ];

export const MenuItems: any = [
  {
    menutitle: "MAIN",
  },
  {
    icon: DashboardIcon,
    title: "Dashboard",
    type: "link",
    active: true,
    selected: true,
    path: "/",
  },
  {
    icon: ExplorerIcon,
    title: "BlueRitt Explorer",
    type: "link",
    active: false,
    selected: false,
    path: "/explorer",
  },
  {
    icon: MyListingsIcon,
    title: "BlueRitt ProductVault",
    type: "link",
    active: false,
    selected: false,
    path: `${import.meta.env.BASE_URL}listings`,
  },
  {
    icon: ProfitProIcon,
    title: "BlueRitt MarginMax",
    type: "sub",
    active: false,
    selected: false,
    children: [
      {
        path: "/profit-pro/basic",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Basic",
      },
      {
        path: "/profit-pro/pro",
        type: "link",
        active: false,
        selected: false,
        dirchange: false,
        title: "Advance",
      },
    ],
  },
  {
    icon: ThirdPartyIcon,
    title: "BlueRitt ToolFusion",
    type: "link",
    active: false,
    selected: false,
    path: "/settings/Toolfusion",
  },
  {
  icon: SocialIcon, 
  title: "BlueRitt SocialPulse",
  type: "sub",
  active: false,
  selected: false,
  children: [
    {
      path: "/socialpulse/amazon",   // ✅ goes to your SocialPage
      type: "link",
      active: false,
      selected: false,
      dirchange: false,
      title: "Amazon Trends",
    },
    {
      path: "/socialpulse/tiktok",
      type: "link",
      active: false,
      selected: false,
      dirchange: false,
      title: "TikTok Trends",
    },
  ],
},

  // {
  //   icon: ThirdPartyIcon,
  //   title: "BlueRitt ToolFusion",
  //   type: "sub",
  //   active: false,
  //   selected: false,
  //   // children: [
  //   //   {
  //   //     path: `${import.meta.env.BASE_URL}`,
  //   //     type: "link",
  //   //     active: false,
  //   //     selected: false,
  //   //     dirchange: false,
  //   //     title: "Tiktok",
  //   //   },
  //   //   {
  //   //     path: `${import.meta.env.BASE_URL}`,
  //   //     type: "link",
  //   //     active: false,
  //   //     selected: false,
  //   //     dirchange: false,
  //   //     title: "Pinterest",
  //   //   },
  //   //   {
  //   //     path: `${import.meta.env.BASE_URL}`,
  //   //     type: "link",
  //   //     active: false,
  //   //     selected: false,
  //   //     dirchange: false,
  //   //     title: "Seasonal Product Recommendation",
  //   //   },
  //   // ],
  // },
  // {
  //   icon: AIIcon,
  //   title: "AI Companion",
  //   type: "sub",
  //   active: false,
  //   selected: false,
  //   children: [
  //     {
  //       path: `${import.meta.env.BASE_URL}`,
  //       type: "link",
  //       active: false,
  //       selected: false,
  //       dirchange: false,
  //       title: "Selling Price Advisor",
  //     },
  //     {
  //       path: `${import.meta.env.BASE_URL}`,
  //       type: "link",
  //       active: false,
  //       selected: false,
  //       dirchange: false,
  //       title: "Supplier Advisor",
  //     },
  //     {
  //       path: `${import.meta.env.BASE_URL}`,
  //       type: "link",
  //       active: false,
  //       selected: false,
  //       dirchange: false,
  //       title: "Visual Search",
  //     },
  //   ],
  // },
 
  // {
  //   icon: ThirdPartyIcon,
  //   title: "Third Party Tools",
  //   type: "link",
  //   active: false,
  //   selected: false,
  //   path: `${import.meta.env.BASE_URL}`,
  // },
  {
    icon: SettingsIcon,
    title: "Settings",
    type: "link",
    active: false,
    selected: false,
    path: "/settings",
  },
  {
    icon: support,
    title: "Support",
    type: "link",
    active: false,
    selected: false,
    path: "/settings/support",
  },
  {
    icon: logoutIcon,
    title: "Log Out",
    type: "empty", 
    active: false,
    selected: false
  }
  
  
];

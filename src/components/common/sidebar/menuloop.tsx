
import { Fragment } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ThemeChanger } from "../../../redux/action";
import SpkButton from "../../../@spk/uielements/spk-button";

function Menuloop({ local_varaiable ,MenuItems, toggleSidemenu, level , HoverToggleInnerMenuFn}: any) {

  const handleClick = (event:any) => {
		// Your logic here
		event.preventDefault(); // Prevents the default anchor behavior (navigation)
		// ... other logic you want to perform on click
	};
  
  return (
    <Fragment>
      <Link to="#" className={`side-menu__item ${MenuItems?.selected ? "active" : ""}`}
        onClick={(event) => { event.preventDefault(); toggleSidemenu(event, MenuItems); }} onMouseEnter={ (event) =>HoverToggleInnerMenuFn(event, MenuItems)}>

          <span className={`hs-tooltip inline-block [--placement:right] leading-none ${local_varaiable?.dataVerticalStyle == 'doublemenu' ? '' : 'hidden'}`}>
              <SpkButton buttontype="button" customClass="hs-tooltip-toggle  inline-flex justify-center items-center">
                {MenuItems.icon}
                <span className="hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-2 px-3 rounded-sm bg-black text-xs font-medium text-white shadow-sm dark:bg-neutral-700" role="tooltip">
                  {MenuItems.title}
                </span>
              </SpkButton>
         </span>
         {local_varaiable?.dataVerticalStyle != "doublemenu" ? MenuItems.icon :""}
            
          <span className={`${level == 1 ? "side-menu__label" : ""}`}> {MenuItems.title} {MenuItems.badgetxt ? (<span className={MenuItems.class}> {MenuItems.badgetxt} </span>
        ) : (
          ""
        )}
        </span>
        <i className="fe fe-chevron-right side-menu__angle"></i>
      </Link>
      <ul className={`slide-menu child${level}  ${MenuItems.active ? 'double-menu-active' : ''} ${MenuItems?.dirchange ? "force-left" : ""} `} style={MenuItems.active ? { display: "block" } : { display: "none" }}>
        {level <= 1 ? <li className="slide side-menu__label1">
          <Link to="#">{MenuItems.title}</Link>
        </li> : ""}
        {MenuItems.children.map((firstlevel: any, index:any) =>
          <li className={`${firstlevel.menutitle ? 'slide__category' : ''} ${firstlevel?.type == 'empty' ? 'slide' : ''} ${firstlevel?.type == 'link' ? 'slide' : ''} ${firstlevel?.type == 'sub' ? 'slide has-sub' : ''} ${firstlevel?.active ? 'open' : ''} ${firstlevel?.selected ? 'active' : ''}`} key={index}>
            {firstlevel.type === "link" ?
              <Link to={firstlevel.path +"/"} className={`side-menu__item ${firstlevel.selected ? 'active' : ''}`}>{firstlevel.icon}
                <span className=""> {firstlevel.title} {firstlevel.badgetxt ? (<span className={firstlevel.class}> {firstlevel.badgetxt}</span>
                ) : (
                  ""
                )}
                </span>
              </Link>
              : ""}
            {firstlevel.type === "empty" ?
              <Link to="#" className='side-menu__item' onClick={handleClick}> {firstlevel.icon}<span className=""> {firstlevel.title} {firstlevel.badgetxt ? (<span className={firstlevel.class}> {firstlevel.badgetxt} </span>
              ) : (
                ""
              )}
              </span>
              </Link>
              : ""}
            {firstlevel.type === "sub" ?
              <Menuloop MenuItems={firstlevel} toggleSidemenu={toggleSidemenu} HoverToggleInnerMenuFn={HoverToggleInnerMenuFn} level={level + 1} />
              : ''}

          </li>
        )}
      </ul>
    </Fragment>
  );
}

const mapStateToProps = (state: any) => ({
	local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(Menuloop);

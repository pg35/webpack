import React, { useState, useEffect, useReducer } from "react";

function createAction(type, data = {}) {
  return {
    type,
    ...data
  };
}
function createListAction(list, type, data = {}) {
  return {
    list,
    type,
    ...data
  };
}
function createListItem(list, action) {
  switch (action.list) {
    case SECTION_LIST:
      return {
        active: true,
        name: `Section # ${list.length + 1}`,
        items: []
      };
    case IMG_LIST:
      return {
        id: -1,
        name: "",
        url: ""
      };
    case RNG_LIST:
      return {
        id: -1,
        name: "",
        min: 1,
        max: 10,
        step: 1,
        def: 1
      };
    case CSH_LIST:
      return {
        id: "n" + (list.length + 1),
        name: "",
        desc: ""
      };
    default:
      throw new Error("unknown createlist action " + action.type);
  }
}
const INIT_APP = "INIT_APP";
const EDIT_UI = "EDIT_UI";

const EDIT_PANEL = "EDIT_PANEL";

const ADD_ITEM = "ADD_ITEM";
const EDIT_ITEM = "EDIT_ITEM";
const REMOVE_ITEM = "REMOVE_ITEM";

const SECTION_LIST = "SECTION_LIST_";
const IMG_LIST = "IMG_LIST_";
const RNG_LIST = "RNG_LIST_";
const CSH_LIST = "CSH_LIST_";

function listReducer(state, action) {
  switch (action.type) {
    case ADD_ITEM:
      return state.concat(
        action.item ? action.item : createListItem(state, action)
      );
    case EDIT_ITEM:
      return state.map((item, index) => {
        if (index === action.index) return { ...state[index], ...action.data };
        return item;
      });
    case REMOVE_ITEM:
      return state.filter((item, index) => index !== action.index);
    default:
      throw new Error("unknown list action " + action.type);
  }
}

function reducer(state, action) {
  console.log("%c Reducer", "color:green;font-weight:bold");
  console.log(action, state);
  if (action.list) {
    if (SECTION_LIST === action.list) {
      return {
        ...state,
        ui: { ...state.ui, dirty: true },
        [action.panelId]: {
          ...state[action.panelId],
          sections: listReducer(state[action.panelId].sections, action)
        }
      };
    } else if (
      IMG_LIST === action.list ||
      RNG_LIST === action.list ||
      CSH_LIST === action.list
    ) {
      return {
        ...state,
        ui: { ...state.ui, dirty: true },
        [action.panelId]: {
          ...state[action.panelId],
          sections: state[action.panelId].sections.map((item, index) => {
            if (index === action.sectionId) {
              const n = {
                ...item,
                items: listReducer(item.items, action)
              };
              return n;
            }
            return item;
          })
        }
      };
    }
  }
  //console.log("action", action);
  switch (action.type) {
    case INIT_APP:
      return action.state;
    case EDIT_UI:
      return {
        ...state,
        ui: { ...state.ui, ...action }
      };
    case EDIT_PANEL:
      return {
        ...state,
        ui: { ...state.ui, dirty: true },
        [action.panelId]: {
          ...state[action.panelId],
          ...action.data
        }
      };
    default:
      throw new Error("unknown action " + action.type);
  }
}
function Active(props) {
  return (
    <label className="pxq_prdons_active">
      <input
        type="checkbox"
        value="1"
        checked={props.active}
        onChange={props.onChange}
      />{" "}
      {props.active ? "Visible on frontend" : "Hidden on frontend"}{" "}
    </label>
  );
}
function Panel(props) {
  const {
    id,
    data: { active, sections },
    dispatch
  } = props;
  if (id === "fabrics") console.log("fabrics", props);
  return (
    <div
      id={`pxq_prdons_panel_${id}`}
      className={`pxq_prdons_panel ${active ? "pxq_prdons--active" : ""}`}
    >
      <div className="pxq_prdons_panel__header">
        <h2>{props.name}</h2>
        <Active
          active={active}
          onChange={() =>
            dispatch(
              createAction(EDIT_PANEL, {
                panelId: id,
                data: { active: !active }
              })
            )
          }
        />
      </div>
      <div className="pxq_prdons_panel__body">
        {sections.map((item, index) => (
          <Section
            key={index}
            panelId={id}
            index={index}
            data={item}
            dispatch={dispatch}
          />
        ))}
      </div>
      <div className="pxq_prdons_panel__footer">
        <button
          type="button"
          className="button"
          onClick={() =>
            dispatch(
              createListAction(SECTION_LIST, ADD_ITEM, {
                panelId: id
              })
            )
          }
        >
          Add section
        </button>
      </div>
    </div>
  );
}

function Section(props) {
  const {
    panelId,
    index,
    data: { active, name, items, defItemId, tag = "", allow_skip = false },
    dispatch
  } = props;
  let ListComponent = null;
  if ("fabrics" === panelId) ListComponent = ImageList;
  else if ("size" === panelId) ListComponent = RangeList;
  else if ("cushions" === panelId) ListComponent = CushionList;
  return (
    <div className={`pxq_prdons_section ${active ? "pxq_prdons--active" : ""}`}>
      <div className="pxq_prdons_section__header">
        <h2>{name}</h2>
        <Active
          active={active}
          onChange={() =>
            dispatch(
              createListAction(SECTION_LIST, EDIT_ITEM, {
                panelId,
                index,
                data: {
                  active: !active
                }
              })
            )
          }
        />
        <button
          type="button"
          onClick={() =>
            dispatch(
              createListAction(SECTION_LIST, REMOVE_ITEM, {
                panelId,
                index
              })
            )
          }
        >
          Delete section
        </button>
      </div>
      <div className="pxq_prdons_section__body">
        <div className="pxq_prdons_field">
          <label>
            <input
              type="text"
              value={name}
              placeholder="Enter section name"
              onChange={(e) =>
                dispatch(
                  createListAction(SECTION_LIST, EDIT_ITEM, {
                    panelId,
                    index,
                    data: {
                      name: e.target.value
                    }
                  })
                )
              }
            />
          </label>
        </div>
        <ListComponent
          panelId={panelId}
          sectionId={index}
          items={items}
          dispatch={dispatch}
          defItemId={defItemId}
        />
      </div>
      <div className="pxq_prdons_section__footer">
        <div className="pxq_prdons_field">
          <label htmlFor={`pxq_prdons_${panelId}_${index}_tag`}>Tag</label>
          <input
            type="text"
            name="tag"
            id={`pxq_prdons_${panelId}_${index}_tag`}
            value={tag}
            placeholder="e.g Made in 14 days"
            onChange={(e) =>
              dispatch(
                createListAction(SECTION_LIST, EDIT_ITEM, {
                  panelId,
                  index,
                  data: {
                    tag: e.target.value
                  }
                })
              )
            }
          />
        </div>
        {"fabrics" === panelId && (
          <div className="pxq_prdons_field">
            <label htmlFor={`pxq_prdons_${panelId}_${index}_later`}>
              <input
                type="checkbox"
                name="allow_skip"
                id={`pxq_prdons_${panelId}_${index}_later`}
                checked={allow_skip}
                onChange={(e) =>
                  dispatch(
                    createListAction(SECTION_LIST, EDIT_ITEM, {
                      panelId,
                      index,
                      data: {
                        allow_skip: !allow_skip
                      }
                    })
                  )
                }
              />{" "}
              Show checkbox to let customer skip this section
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
function ImageList(props) {
  const { panelId, sectionId, items, dispatch } = props;
  function isImgAlreadyAdded(id) {
    for (var i = 0; i < items.length; ++i) {
      if (items[i].id === id) {
        alert("This image already exists in this section.");
        return true;
      }
    }
    return false;
  }
  return (
    <div>
      <ul className="pxq_prdons_imglist">
        {items.map((item, index) => (
          <ImageItem
            key={index}
            item={item}
            index={index}
            isImgAlreadyAdded={isImgAlreadyAdded}
            {...props}
          />
        ))}
      </ul>
      <div>
        <button
          type="button"
          onClick={() =>
            pxq_prdons_Media.open((attachements) =>
              attachements.forEach(
                (item) =>
                  !isImgAlreadyAdded(item.id) &&
                  dispatch(
                    createListAction(IMG_LIST, ADD_ITEM, {
                      panelId,
                      sectionId,
                      item: {
                        id: item.id,
                        name: item.name,
                        url: item.sizes.thumbnail.url
                      }
                    })
                  )
              )
            )
          }
        >
          Add image
        </button>
      </div>
    </div>
  );
}

function ImageItem(props) {
  const { panelId, sectionId, item, index, dispatch, defItemId } = props;
  return (
    <li key={index}>
      <label>
        <input
          type="radio"
          name={`pxq_prdons_${panelId}_${sectionId}`}
          value={item.id}
          checked={item.id === defItemId}
          onChange={(e) =>
            dispatch(
              createListAction(SECTION_LIST, EDIT_ITEM, {
                panelId,
                index: sectionId,
                data: {
                  defItemId: item.id
                }
              })
            )
          }
        />{" "}
        Default
      </label>
      <img
        src={item.url}
        alt={`attachement-${item.id}`}
        onClick={(e) =>
          pxq_prdons_Media.open(
            (attachement) =>
              attachement[0].id !== item.id &&
              !props.isImgAlreadyAdded(attachement[0].id) &&
              dispatch(
                createListAction(IMG_LIST, EDIT_ITEM, {
                  panelId,
                  sectionId,
                  index,
                  data: {
                    id: attachement[0].id,
                    url: attachement[0].sizes.thumbnail.url,
                    name: attachement[0].name
                  }
                })
              )
          )
        }
      />
      <input
        type="text"
        value={item.name}
        onChange={(e) =>
          dispatch(
            createListAction(IMG_LIST, EDIT_ITEM, {
              panelId,
              sectionId,
              index,
              data: {
                name: e.target.value
              }
            })
          )
        }
      />
      <button
        type="button"
        onClick={() =>
          dispatch(
            createListAction(IMG_LIST, REMOVE_ITEM, {
              panelId,
              sectionId,
              index
            })
          )
        }
      >
        Delete
      </button>
    </li>
  );
}

function RangeList(props) {
  const { panelId, sectionId, items, dispatch } = props;
  const handleItemChange = function (e, index) {
    const item = { ...items[index] };
    const name = e.target.name;
    const value = e.target.value;
    console.log(e.target.type, name, value, item);
    if ("number" === e.target.type) {
      if (value && !/^(\+|-)?\d+$/.test(value)) return;
      const n = parseInt(value);
      item[name] = isNaN(n) ? 0 : n;
      if (item.min > item.max - 1) item.min = item.max - 1;
      if (item.max < item.min + 1) item.max = item.min + 1;
      if (item.def < item.min) item.def = item.min;
      if (item.def > item.max) item.def = item.max;
      if (item.step < 1) item.step = 1;
      if (item.step > item.max - item.min) item.step = item.max - item.min;
    } else if ("text" === e.target.type) {
      item.name = value;
    }
    dispatch(
      createListAction(RNG_LIST, EDIT_ITEM, {
        panelId,
        sectionId,
        index,
        data: item
      })
    );
  };
  return (
    <div>
      <div className="pxq_prdons_rangelist">
        {items.map((item, index) => (
          <RangeItem
            key={index}
            item={item}
            index={index}
            onItemChange={handleItemChange}
            {...props}
          />
        ))}
      </div>
      <div>
        <button
          type="button"
          onClick={() =>
            dispatch(
              createListAction(RNG_LIST, ADD_ITEM, {
                panelId,
                sectionId
              })
            )
          }
        >
          Add range input
        </button>
      </div>
    </div>
  );
}

function RangeItem(props) {
  const { panelId, sectionId, item, index, onItemChange, dispatch } = props;
  if ("undefined" === typeof item.def) item.def = item.min;
  return (
    <div className="pxq_prdons_rangeitem">
      <div className="pxq_prdons_rangeitem__header">
        <div className="pxq_prdons_field">
          <label htmlFor={`pxq_prdons_${panelId}_${sectionId}_${index}_name`}>
            Name
          </label>
          <input
            type="text"
            name="name"
            id={`pxq_prdons_${panelId}_${sectionId}_${index}_name`}
            value={item.name}
            onChange={(e) => onItemChange(e, index)}
          />
        </div>
        <button
          type="button"
          onClick={() =>
            dispatch(
              createListAction(RNG_LIST, REMOVE_ITEM, {
                panelId,
                sectionId,
                index
              })
            )
          }
        >
          Delete
        </button>
      </div>
      <div className="pxq_prdons_rangeitem__body">
        <div className="pxq_prdons_field">
          <label htmlFor={`pxq_prdons_${panelId}_${sectionId}_${index}_min`}>
            Min
          </label>
          <input
            type="number"
            name="min"
            id={`pxq_prdons_${panelId}_${sectionId}_${index}_min`}
            value={item.min.toString()}
            onChange={(e) => onItemChange(e, index)}
          />
        </div>
        <div className="pxq_prdons_field">
          <label htmlFor={`pxq_prdons_${panelId}_${sectionId}_${index}_max`}>
            Max
          </label>
          <input
            type="number"
            name="max"
            id={`pxq_prdons_${panelId}_${sectionId}_${index}_max`}
            value={item.max.toString()}
            onChange={(e) => onItemChange(e, index)}
          />
        </div>
        <div className="pxq_prdons_field">
          <label htmlFor={`pxq_prdons_${panelId}_${sectionId}_${index}_step`}>
            Step
          </label>
          <input
            type="number"
            name="step"
            id={`pxq_prdons_${panelId}_${sectionId}_${index}_step`}
            value={item.step.toString()}
            onChange={(e) => onItemChange(e, index)}
          />
        </div>
        <div className="pxq_prdons_field">
          <label htmlFor={`pxq_prdons_${panelId}_${sectionId}_${index}_def`}>
            Default
          </label>
          <input
            type="number"
            name="def"
            id={`pxq_prdons_${panelId}_${sectionId}_${index}_def`}
            value={item.def.toString()}
            onChange={(e) => onItemChange(e, index)}
          />
        </div>
      </div>
    </div>
  );
}

function CushionList(props) {
  const { panelId, sectionId, items, dispatch } = props;
  const handleItemChange = function (e, index) {
    const name = e.target.name;
    const value = e.target.value;
    dispatch(
      createListAction(CSH_LIST, EDIT_ITEM, {
        panelId,
        sectionId,
        index,
        data: { [name]: value }
      })
    );
  };
  return (
    <div>
      <div className="pxq_prdons_rangelist pxq_prdons_cshlist">
        {items.map((item, index) => (
          <CushionItem
            key={index}
            item={item}
            index={index}
            onItemChange={handleItemChange}
            {...props}
          />
        ))}
      </div>
      <div>
        <button
          type="button"
          onClick={() =>
            dispatch(
              createListAction(CSH_LIST, ADD_ITEM, {
                panelId,
                sectionId
              })
            )
          }
        >
          Add cushion
        </button>
      </div>
    </div>
  );
}

function CushionItem(props) {
  const {
    panelId,
    sectionId,
    item,
    index,
    onItemChange,
    defItemId,
    dispatch
  } = props;
  return (
    <div className="pxq_prdons_rangeitem">
      <div className="pxq_prdons_rangeitem__header">
        <label>
          <input
            type="radio"
            name={`pxq_prdons_${panelId}_${sectionId}`}
            value={item.id}
            checked={item.id === defItemId}
            onChange={(e) =>
              dispatch(
                createListAction(SECTION_LIST, EDIT_ITEM, {
                  panelId,
                  index: sectionId,
                  data: {
                    defItemId: item.id
                  }
                })
              )
            }
          />{" "}
          Most Popular
        </label>
        <button
          type="button"
          onClick={() =>
            dispatch(
              createListAction(CSH_LIST, REMOVE_ITEM, {
                panelId,
                sectionId,
                index
              })
            )
          }
        >
          Delete
        </button>
        <div className="pxq_prdons_field">
          <label htmlFor={`pxq_prdons_${panelId}_${sectionId}_${index}_name`}>
            Name
          </label>
          <input
            type="text"
            name="name"
            id={`pxq_prdons_${panelId}_${sectionId}_${index}_name`}
            value={item.name}
            onChange={(e) => onItemChange(e, index)}
          />
        </div>
      </div>
      <div className="pxq_prdons_rangeitem__body">
        <div className="pxq_prdons_field">
          <label htmlFor={`pxq_prdons_${panelId}_${sectionId}_${index}_desc`}>
            Discription
          </label>
          <input
            type="text"
            name="desc"
            id={`pxq_prdons_${panelId}_${sectionId}_${index}_desc`}
            value={item.desc}
            onChange={(e) => onItemChange(e, index)}
          />
        </div>
      </div>
    </div>
  );
}
function DecideLater(props) {
  const { panelId, sectionId, later = false, laterText = "" } = props;
  return (
    <div>
      <div className="pxq_prdons_field">
        <label htmlFor={`pxq_prdons_${panelId}_${sectionId}__later`}>
          Show checkbox to let user skip this section
        </label>
        <input
          type="checkbox"
          name="later"
          id={`pxq_prdons_${panelId}_${sectionId}_later`}
          checked={item.later}
          onChange={(e) => onItemChange(e, index)}
        />
      </div>
      <div className="pxq_prdons_field">
        <label
          htmlFor={`pxq_prdons_${panelId}_${sectionId}_${index}_later_text`}
        >
          Checkbox text
        </label>
        <input
          type="text"
          name="later_text"
          id={`pxq_prdons_${panelId}_${sectionId}_${index}_later_text`}
          value={item.laterText}
          onChange={(e) => onItemChange(e, index)}
        />
      </div>
    </div>
  );
}
const initialState = {
  ui: {
    dirty: false,
    save: {
      doing: false,
      result: null
    }
  },
  fabrics: {
    active: true,
    sections: [
      {
        active: true,
        name: "hello",
        items: [
          {
            id: 1,
            name: "abc",
            url: ""
          }
        ]
      }
    ]
  },
  size: {
    active: true,
    sections: [
      {
        active: true,
        name: "1st measure",
        items: []
      }
    ]
  },
  cushions: {
    active: true,
    sections: [
      {
        active: true,
        name: "helllo cusho",
        items: []
      }
    ]
  }
};
function filterState(state) {
  let newState = { ...state };
  delete newState.ui;
  console.log("filtered", newState);
  return newState;
}
export default function App() {
  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    ui: initialState.ui
  });
  const {
    ui: { dirty, save }
  } = state;

  useEffect(() => {
    pxq_prdons_doAjax(
      {
        data: {
          action: "pxq_prdons_init",
          product_id: window.pxq_prdons_product_id
        }
      },
      (res) =>
        dispatch(
          createAction(INIT_APP, {
            state: { ...res.data, ui: initialState.ui }
          })
        )
    );
  }, []);
  //console.log("state.ui", state.ui);
  if (state.loading) {
    return (
      <div className="pxq_prdons_loading">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div id="pxq_prdons">
      <Panel
        id="fabrics"
        name="Fabrics"
        data={state.fabrics}
        dispatch={dispatch}
      />
      <Panel
        id="size"
        name="Measurements"
        data={state.size}
        dispatch={dispatch}
      />
      <Panel
        id="cushions"
        name="Cushions"
        data={state.cushions}
        dispatch={dispatch}
      />
      <div className="pxq_prdons_save">
        {save.result && (
          <span
            className={`pxq_prdons_${save.result.ok ? "success" : "error"}`}
          >
            {save.result.ok ? "Saved" : save.result.msg}
          </span>
        )}
        <button
          className="button button-primary"
          onClick={(e) => {
            e.preventDefault();
            dispatch(
              createAction(EDIT_UI, { save: { doing: true, result: null } })
            );
            pxq_prdons_doAjax(
              {
                data: {
                  action: "pxq_prdons_save",
                  product_id: window.pxq_prdons_product_id,
                  data: JSON.stringify(filterState(state))
                },
                method: "POST"
              },
              () =>
                dispatch(
                  createAction(EDIT_UI, {
                    dirty: false,
                    save: { doing: false, result: { ok: true } }
                  })
                ),
              (errMsg) =>
                dispatch(
                  createAction(EDIT_UI, {
                    save: { doing: false, result: { ok: false, msg: errMsg } }
                  })
                )
            );
          }}
          disabled={!dirty}
        >
          {save.doing ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
/*
function pxq_prdons_doAjax(args, onSuccess, onFail, onFinally) {
  console.log(args);
  setTimeout(() => {
    onSuccess && onSuccess({ success: true, data: initialState });
    //onSuccess({ success: false, data: { message: "server error" } });
    onFail && onFail(getAjaxFailReason({ status: 400 }, "timeout1"));
    onFinally && onFinally();
  }, 1000);
}
function doAjax5(args, onSuccess, onFail, onFinally) {
  return window.jQuery
    .ajax(window.ajaxurl, { type: "GET", dataType: "json", ...args })
    .done((data, textStatus, jqXHR) => {
      //console.log("done", data, onSuccess);
      onSuccess && onSuccess(data);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      onFail && onFail(getAjaxFailReason(jqXHR, textStatus));
    })
    .always(() => {
      onFinally && onFinally();
    });
}

function getAjaxFailReason(x, exception) {
  var message;
  var statusErrorMap = {
    "0": "Not connected.Please verify your network connection.",
    "400": "Server understood the request, but request content was invalid.",
    "401": "Unauthorized access.",
    "403": "Forbidden resource can't be accessed.",
    "500": "Internal server error.",
    "503": "Service unavailable."
  };
  console.log(x, exception);
  if (x && "undefined" !== typeof x.status && exception !== "abort") {
    message = statusErrorMap[x.status];
  }
  if (!message) {
    if (exception === "parsererror") {
      message = "Parsing JSON failed";
    } else if (exception === "timeout") {
      message = "Request Timed out";
    } else if (exception === "abort") {
      message = "Request aborted";
    } else {
      message = "";
    }
  }
  return message;
}

const pxq_prdons_Media = {
  debug: {
    urls: [
      "data:image/jpeg;base64,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",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAB5CAMAAAAqJH57AAAAaVBMVEX////zcADzdQDzcwD0eAD72ML4to396+H2kkb849T//Pr97uX959v0ewD+8er71b/+9vH6x6n0gBz4upT5wZ/1jUP6y6/3pG383Mn2oGf1k0z0gyX2mVv1jTz1llX70bn3qnn4r4L0hjGs3yV2AAAFEElEQVRoge2aaZe6LBjGg5s0UFxwwT3x+3/Iv7ZMVsg8YjNznnO8Xlr0Q7hX6HDYtWvXrl27du3atWvXXJHn00m+F7Dfo/qqywbBySQuhqxTuR/9ClkiXrdZV0opy65qaw4ID2Uc/DzZO9PZErOAhkknCCJl+IsL/+AXDsdQx3+AHlWUADz/G7YnAZ8+ud8rto9WwM8fAx8HZ8W3E0KSD4ETglf9VCiw+gSXlVisXD46fAIdtbh11w7ya5xuBQcCNxbDKEF0G9gTuLcaeAaxKZ4FrSV4jO14jT+8inW4tB0bEeLZk3vc2Q9ONth3jIcNWZdxbhtGPc4Le/DhoMA2cVWwLQhSbrlXZ3x694tjqlvBItXGmkGsDkEXCXiPBSEimq2niAidHSt0tAHnoHEoxQV6f4+UC9BZxBlZuXQG/vtDSqB53wKPQ6ZzAkqsAi+qdI/dQofwtE8PXp1ZkBXeXk9FrUU8YC36QAGb1etjiadf7F8g52hzZrckKxxuBzMbckk2lhSTrCyssc4zM9l4Fev4B7pSm0jCqk+QQ5vo2XBdCvATZ1Eau1DIwkylzsIoBrQkIO95qeUWWVKBpq3oSXJcUvpeK7q8soiDuW6LTLE8hP6LWBTUd90gxj2L2Fq4B+37QwrD4oCO3DJ0UOJp8QFzIYb2VHVNKWWvHCeJ83NY+L4XRCbrZRnSfNzgpdYuxDfXDQQZlJJlU7ViFLkeIBGMAR5GwqWhFFdYUziOZY9+8aIa3wxMEnl75sAY+hmLPNenxTE853GcOqqXTXXCBGvKjptcpFtZhU/ab3f3XQ5qcZ8M4stb7OB2+cMOdOVbq213SnIvU11yn5oydvuVodUstBmatbh73aOgwcM9yn+RXWx45bF9QYYuoAKdD0UVruP5b7K8hsdp0Be5MTcYuYns64to5oyVZno7AmRBfALSP2ZyJ8c6r5yTwVR5OLjTLhhtCOCqH2N1X2Eg3bzUvpEpJ8vGeyUbO6cMFvpQPxFjrJg8VLxkiis5Gr47JjmDMY1FYrnvj2gYhvRtTa7kCqRmyArywRdkZYa9kMv7NjFZ3ufGyn4+zfC7tp7WupxlJFcjuL1FXoq+gkKB0HznvyVHg667MpJPEtq7kzH1eFGp5u9cfHfyk3y7YS/yuCDa7u5FBTGTg3ptVRFzoWk215PVklstaMzNwhxB7qLEuJguF2uqbuYAroU+ma0ky0eI80Pn5BiNLUgIJukjV31HNh3xUX7xDrdIuuleCAHPUn+hMjhKAUQFhzmZlc+BLJmZns9N5IYkfiwzAQiGToVuWhHEM5lT7ylXBX5eDhgGNeWXOTkSZI5OyWzvXBO5IGLACOqsz+l1CPPTqh4fiayRKklHOX3ZjV/CdRle3+dptY8cd2E0TZNFYYXn53oeNzQ+CkTdpMVLpvSKpJwuBvElY4wVJq+75HFM8rzP9ESQaHrVNwKR09xMAhM5OC/6cuQWl4ouPx/ps/W/WthRkusM5fOxlZFsJY1tB5TSN+eMuD73f5SsVWTV+Zj0qHrNCo3+bKX+P10/UKGtqTfJq3GlnCSdeig6NnbBqCgaG7vb4gZTry35Z67SXtAVx48WCoBwUbdt1jXNJazEMBo7ET9zWeyHk8ulydhElV2X1fzmWNBE0w2FKsJNVwVrxSK/xZyam4sfg/cAcW59ubFJOSED+Zv/A9CB/xH5wJqVZfQH9YHz1F27du3atWvXrl27/of6B/cHSEaG+Bb0AAAAAElFTkSuQmCC",
      "data:image/jpeg;base64,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",
      "data:image/jpeg;base64,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"
    ],
    id: 1
  },
  frame: null,
  cb: null,
  init: function () {},
  open: function (cb) {
    this.cb = cb;
    var self = this;
    setTimeout(function () {
      let ret = [];
      for (let i = 0; i < 3; ++i) {
        ret.push({
          id: self.debug.id,
          sizes:{
            thumbnail:{
              url: self.debug.urls[
                Math.round(Math.random() * (self.debug.urls.length - 1))
              ],
            },
          },
          name: `img-${self.debug.id}`
        });
        self.debug.id++;
      }
      cb(ret);
    }, 1000);
  }
};
*/

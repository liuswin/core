(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('prop-types')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'prop-types'], factory) :
  (factory((global.CRUD = {}),global.React,global.PropTypes));
}(this, (function (exports,react,PropTypes) { 'use strict';

  var react__default = 'default' in react ? react['default'] : react;
  PropTypes = PropTypes && PropTypes.hasOwnProperty('default') ? PropTypes['default'] : PropTypes;

  class Page extends react.Component {
    goBack() {
      const {
        history
      } = this.props;
      history.goBack();
    }

    goAdd() {
      this.goRoutes(`add`);
    }

    goEdit(route) {
      this.goRoutes(`edit/${route}`);
    }

    goRoutes(route) {
      const {
        history,
        match
      } = this.props;
      history.push(`${match.path}/${route}`);
    }

    componentDidCatch(error, errorInfo) {
      // Display fallback UI
      this.setState({
        error: error,
        errorInfo: errorInfo
      });
    }

  }

  /**
   * 列表页的父类组件
   * @type {component}
   */

  class ListPage extends Page {
    //  static childContextTypes = {
    //        appConfig : PropTypes.object
    //  }
    //
    //  getChildContext(){
    //   var { appConfig } =this.props;
    //   return {
    //       appConfig: appConfig
    //   };
    // }
    constructor(props) {
      super(props);
      this.state = {
        selectedRows: [],
        selectedRowKeys: []
      };
    } //缺失深度合并，只做一级合并


    mergeTableConfig(config) {
      return Object.assign({
        size: 'middle',
        pagination: {
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'] // showTotal:this.showTotal(this),

        },
        style: {
          width: '100%'
        }
      }, config, {
        rowSelection: {
          onChange: this.onSelectChange.bind(this),
          selectedRowKeys: this.state.selectedRowKeys
        }
      });
    }
    /**
     * 组件开始请求获取数据
     * @return {[type]} [description]
     */


    componentWillMount() {
      let {
        actions
      } = this.props; //  actions.listAction();
    }
    /**
     * [onSelectChange ]
     * @param  {[type]} selectedRowKeys [description]
     * @param  {[type]} selectedRows    [description]
     * @return {[type]}                 [description]
     */


    onSelectChange(selectedRowKeys, selectedRows) {
      this.setState({
        selectedRowKeys,
        selectedRows
      });
    }
    /*
    selectRowShow(reactNode){
      const {selectedRowKeys}=this.state
      return selectedRowKeys.length>0 ? (<div className="ant-table-title-toolbar" style={{textAlign:'left'}}><span>已选<span className="countNum">{selectedRowKeys.length}</span>条数据</span>{reactNode}</div>) :null
    }
    */

    /**
     * [selectMultiple 判断当前是否多选]
     * @return {[boolean]} [返回是否多选状态]
     */


    selectMultiple() {
      return this.getSelectLength() <= 0;
    }
    /**
     * [selectSingle 判断当前是否单选]
     * @return {[type]} [返回当前是否单选状态]
     */


    selectSingle() {
      return this.getSelectLength() != 1;
    }
    /**
     * [getSelectLength 获取当前列表选中记录数量]
     * @return {[number]} [返回选中记录数量]
     */


    getSelectLength() {
      return this.getSelectRows().length;
    }
    /**
     * [getSelectKeys 获取选中列表的RowKeys]
     * @return {[array[string]]} [返回数组 keys]
     */


    getSelectKeys() {
      return this.state.selectedRowKeys;
    }
    /**
     * [getSelectRows 获取选中列表行数据]
     * @return {[array[object]]} [返回选中记录数据]
     */


    getSelectRows() {
      return this.state.selectedRows;
    }
    /**
     * [clearSelectRows 清空已选列清数据记录]
     * @return null
     **/


    clearSelectRows() {
      this.setState({
        selectedRowKeys: [],
        selectedRows: []
      });
    }
    /**
     * 新增路由监听
     * @return {无}
     */


    handleAddRoute() {
      this.goAdd();
    }
    /**
     * 编辑路由监听
     * @param  {key} id [description]
     * @return {[type]}    [description]
     */


    handleEditRoute(id) {
      let key = id || this.getSelectKeys();
      this.goEdit(key);
    }
    /**
     * 取消或回退路由监听
     * @return {[null]}
     */


    handleBackRoute() {
      this.goBack();
    }
    /**
     * [handleDeleteRoute 删除路由监听]
     * @param  {[rowskey]} id [description]
     * @return {[null]}    [description]
     */


    handleDeleteRoute(id) {
      let {
        actions,
        history
      } = this.props;
      let key = id || this.getSelectKeys();
      actions.deleteRoute(key);
    }
    /**
     * [handleFilter 监听过滤方法，即搜索提交]
     * @param  {[object]} value [过滤数据条件对象]
     * @return {[type]}       [无]
     */


    handleFilter(value) {
      let {
        actions
      } = this.props;
      this.clearSelectRows();
      actions.listAction(value);
    }
    /**
     * [onChange 表格分页排序发生变化]
     * @param  {[type]} pagination [description]
     * @param  {[type]} filters    [description]
     * @param  {[type]} sorter     [description]
     * @return {[type]}            [description]
     */


    onChange(pagination, filters, sorter) {
      let {
        reducer
      } = this.props; // this.querys()

      var object = Object.assign({}, this.searchParams(), pagination, sorter);
      this.handleFilter(object);
    }
    /**
      *  获取查询条件参数
      *
      */


    searchParams() {
      const {
        querys
      } = this.props;
      console.info("override searchPrams method!");
      return {};
    }
    /**
     * 渲染搜索组件
     * @return {null} [description]
     */


    renderSearchBar() {
      return null;
    }

    render() {
      return null;
    }

  }
  ListPage.propTypes = {
    items: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    types: PropTypes.object,
    spins: PropTypes.func,
    querys: PropTypes.func
  };

  class FormPage extends Page {
    constructor(props) {
      super(props);
      this.state = {
        error: null,
        errorInfo: null
      };
    }

    saveFormRef(form) {
      this.form = form;
    }

    onSubmit(actionType) {
      if (actionType === 'handleSubmit') {
        this.form.validateFieldsAndScroll({
          force: true,
          first: true
        }, (err, values) => {
          if (err) {
            return;
          }

          this.handleSubmit(values);
        });
      } else {
        this[actionType].apply(this, [this.form.getFieldsValue()]);
      }
    }

    handleSubmit(values) {
      let {
        actions
      } = this.props;
    }

    render() {
      // Normally, just render children
      return this.props.children;
    }

  }

  exports.ListPage = ListPage;
  exports.FormPage = FormPage;
  exports.ViewPage = Page;
  exports.default = ListPage;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

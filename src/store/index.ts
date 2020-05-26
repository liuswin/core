import {
  createStore,
  applyMiddleware,
  combineReducers,
  Middleware,
  Reducer,
  ReducersMapObject,
  AnyAction,
  Store
} from 'redux';
import React from 'react';
import createSagaMiddleware, {SagaMiddleware} from 'redux-saga';
import {suppressWarnings} from 'core-decorators';
import {Dispatch} from 'redux';
import Model, {ORM, Session, OrmState, SessionBoundModel} from 'redux-orm';
import {IndexedModelClasses} from 'redux-orm/ORM';
import {Location, LocationState} from 'history';
import {
  fetchingMiddleware,
  moduleMiddleware,
  passportMiddleware
} from '../middleware';
import {orm} from '../model';
import {reduxActionProxy} from '../proxy';
import {ActionMiddleWareFactory, Injectable} from '../InjectFactory';

const {
  fetchingReducer,
  fetchReq,
  fetchRes,
  fetchParams,
  fetchReset
} = fetchingMiddleware;
const {
  globalReducer,
  cancelTask,
  upgradeDict,
  upgradeBizcode,
  upgradeConfig,
  upgradeUser,
  upgradeAuths
} = moduleMiddleware;
const {fetchLogining, fetchLogouting, fetchConfig} = passportMiddleware;

export interface ModuleShape {
  //@ts-ignore
  prototype(
    arg0: number,
    prototype: any,
    store: StoreManager<
      IndexedModelClasses<any, string | number | symbol>,
      string | number | symbol
    >,
    arg3: any,
    payload: any
  );
  default: Object;
  model: Model;
  reducer: Reducer;
  saga: any;
}
/**
 *  let store = new Store({reducers:{},middleares:[]})
 *  store.getStore()
 */

export default class StoreManager<
  I extends IndexedModelClasses<any>,
  ModelNames extends keyof I = keyof I
> {
  // private history : any = null
  public registed: Array<string> = [];
  private asyncReducers: ReducersMapObject<
    IndexedModelClasses<I>,
    AnyAction
  > = [];
  private sagaMiddleware!: SagaMiddleware<any>;
  private makeRootReducer: any;
  protected store: Store;

  constructor(
    history: LocationState,
    reducers: Array<Reducer> = [],
    middlewares: Array<Middleware> = [],
    makeRootReducer = combineReducers
  ) {
    this.makeRootReducer = makeRootReducer;
    this.asyncReducers = this.initialReducer(reducers, history);
    this.store = this.createStoreWithMiddleware(
      middlewares,
      history
    )(this.makeRootReducer(this.asyncReducers));
  }

  private createStoreWithMiddleware(
    middlewares: Array<Middleware>,
    history: LocationState
  ) {
    return applyMiddleware.apply(
      this,
      this.initialMiddleware(history, middlewares)
    )(createStore);
  }
  private initialMiddleware(
    history: LocationState,
    middlweares: Array<Middleware>
  ): Array<Middleware> {
    this.sagaMiddleware = createSagaMiddleware();
    return middlweares.concat([this.sagaMiddleware]);
  }

  private initialReducer(reducers: Array<Reducer>, history: LocationState) {
    return {
      appReducer: globalReducer,
      fetchingReducer,
      ...reducers
    };
  }
  private injectSaga(saga: any): void {
    this.sagaMiddleware.run(saga);
  }
  private injectReducer(key: String, reducer: Reducer): void {
    //@ts-ignore
    this.asyncReducers[key] = reducer;
    this.store.replaceReducer(this.makeRootReducer(this.asyncReducers));
    this.store.dispatch({type: '@@redux/REPLACE'});
  }

  private injectModel(orm: ORM<IndexedModelClasses>, model: Model): void {
    Object.values(model)
      .filter((m: SessionBoundModel) => typeof m === 'function')
      .map((m: SessionBoundModel) => {
        /* istanbul ignore else */
        //@ts-ignore
        if (orm.registry.indexOf(m) < 0) {
          //@ts-ignore
          orm.register(m);
        }
      });
    function defaultUpdater(
      session: Session<IndexedModelClasses>,
      action: AnyAction
    ) {
      session.sessionBoundModels.forEach(function(modelClass: any) {
        /* istanbul ignore else */
        if (typeof modelClass.reducer === 'function') {
          modelClass.reducer(action, modelClass, session);
        }
      });
    }
    function createReducer(orm: ORM<IndexedModelClasses>) {
      var updater = defaultUpdater;
      return function(state: OrmState<IndexedModelClasses>, action: AnyAction) {
        var session = orm.session({
          ...orm.getEmptyState(),
          ...state
        });
        updater(session, action);
        return session.state;
      };
    }
    this.injectReducer('ORMReducer', createReducer(orm));
  }

  public getStore(): Store {
    return this.store;
  }

  public loadModule(loaded: ModuleShape): Object {
    //@ts-ignore
    let moduleName = loaded.model.default.modelName;
    /* istanbul ignore else */
    if (this.registed.indexOf(moduleName) < 0) {
      this.registed = this.registed.concat([moduleName]);
      this.injectReducer(moduleName, loaded.reducer);
      this.store.dispatch({
        type: '@@ModuleMiddleware/register',
        payload: {name: moduleName}
      });
      //@ts-ignore
      this.injectModel(orm, loaded.model);
      this.injectSaga(loaded.saga);
    }
    return loaded.default;
  }

  public loadRouterModule(loaded: any): Object {
    //@ts-ignore
    let moduleName = loaded.model.default.modelName;
    /* istanbul ignore else */
    if (this.registed.indexOf(moduleName) < 0) {
      this.registed = this.registed.concat([moduleName]);
      //@ts-ignore
      const reducer = reduxActionProxy(new loaded.reducer());
      this.injectReducer(moduleName, reducer.getReducer());
      this.store.dispatch({
        type: '@@ModuleMiddleware/register',
        payload: {name: moduleName}
      });
      //@ts-ignore
      this.injectModel(orm, loaded.model);
    }
    const dispatch = this.store.dispatch;
    const middlware = {
      fetchReq: () => dispatch(fetchReq({})),
      fetchParams: () => dispatch(fetchParams({})),
      fetchLogining: () => dispatch(fetchLogining({})),
      fetchLogouting: () => dispatch(fetchLogouting({}))
    };
    const result = this.injectAction(
      loaded.default,
      loaded.saga,
      this.store.dispatch,
      moduleName,
      middlware
    );
    return result;
  }
  private middlware2(dispatch: Dispatch) {
    return {
      //@ts-ignore
      fetchingReducer: () => dispatch(fetchingReducer({})),
      fetchReq: () => dispatch(fetchReq({})),
      fetchRes: () => dispatch(fetchRes({})),
      fetchParams: () => dispatch(fetchParams({})),
      fetchReset: () => dispatch(fetchReset({})),

      //@ts-ignore
      globalReducer: () => dispatch(globalReducer({})),
      cancelTask: () => dispatch(cancelTask({})),
      upgradeDict: () => dispatch(upgradeDict({})),
      upgradeBizcode: () => dispatch(upgradeBizcode({})),
      upgradeConfig: () => dispatch(upgradeConfig({})),
      upgradeUser: () => dispatch(upgradeUser({})),
      upgradeAuths: () => dispatch(upgradeAuths({})),

      fetchLogining: () => dispatch(fetchLogining({})),
      fetchLogouting: () => dispatch(fetchLogouting({})),
      fetchConfig: () => dispatch(fetchConfig({}))
    };
  }

  private injectAction(
    component: any,
    actions: any,
    dispatch: Dispatch,
    namespace: string,
    middlware: any
  ) {
    //@ts-ignore
    return props => {
      const dom = React.createElement(component, {
        ...props,
        actions: ActionMiddleWareFactory(
          actions,
          dispatch,
          namespace,
          middlware
        )
      });
      console.log('dom', dom, props);
      return dom;
    };
  }

  @suppressWarnings
  public registerModule(modulePath: any): Promise<ModuleShape> {
    return this.importModule(modulePath);
  }

  public importModule(modulePath: any): Promise<ModuleShape> {
    return new Promise((resolve: any, reject: any) => {
      modulePath.then((module: ModuleShape) => {
        resolve(this.loadModule(module));
      });
    });
  }

  public importRouterModule(modulePath: any): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      modulePath.then((module: any) => {
        resolve(this.loadRouterModule(module));
      });
    });
  }
}

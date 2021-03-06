/**
 * Created by shange on 2016/10/21.
 * 后发App框架示例
 */
import React, {Component} from 'react';
import {HFNavigatorConfig, View, Navigator, StatusBar, BackAndroid, DeviceEventEmitter, AsyncStorage, NetInfo} from './HFFramework/Framework';
import Storage from 'react-native-storage';
import Toast from '@remobile/react-native-toast';

import IndexPage from './Application/Component/IndexPage';

/**
 * 网络环境发生变化
 *
 * none - 设备处于离线状态。
 * wifi - 设备处于联网状态且通过wifi链接，或者是一个iOS的模拟器。
 * cell - 设备是通过Edge、3G、WiMax或是LTE网络联网的。
 * unknown - 发生错误，网络状况不可知
 *
 * @param reach
 */
function handleNetInfoChange(reach) {
    if (reach == 'cell') {
        Toast.showShortCenter("您的网络环境已变为:" + reach + ".");
    } else if (reach == 'none' || reach == 'unknow') {
        Toast.showShortCenter("您已断开网络连接.");
    }
}

var storage = new Storage({
    storageBackend: AsyncStorage,
    // 最大容量，默认值1000条数据循环存储
    size: 1000,
    // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    defaultExpires: 1000 * 3600 * 24,
    // 读写时在内存中缓存数据。默认启用。
    enableCache: true,
    // 如果storage中没有相应数据，或数据已过期，
    // 则会调用相应的sync同步方法，无缝返回最新数据。
    sync: {
        // 同步方法的具体说明会在后文提到
    }
});
global.storage = storage;
class hfFramework extends Component {

    constructor(props) {
        super(props);
        this.navigator = null;
        ErrorUtils.setGlobalHandler((err, isFatal) => {
            if (err != null) {
                console.error(err);
            }
        });
    }

    componentWillMount() {
        let self = this;
        this.rootListener = DeviceEventEmitter.addListener('navigator', function (navigator) {
            self.navigator = navigator;
        });
        // 网络环境
        NetInfo.addEventListener(
            'change',
            handleNetInfoChange
        );
        // 安卓下返回键监听
        BackAndroid.addEventListener('hardwareBsackPress', function () {
            if (self.navigator && self.navigator.getCurrentRoutes().length > 1) {
                self.navigator.pop();
                return true;
            }
            if (self.lastBackPressed && (self.lastBackPressed + 2000 >= Date.now())) {
                //最近2秒内按过back键，可以退出应用。
                BackAndroid.exitApp();
                return true;
            }
            self.lastBackPressed = Date.now();
            Toast.showShortCenter('再按一次退出应用!');
            return true;
        });
    }

    componentWillUnmount() {
        this.rootListener.remove();
        BackAndroid.removeEventListener();
        NetInfo.removeEventListener(
            'change',
            handleNetInfoChange
        );
    }

    render() {
        return (
            <View style={{flex:1,alignSelf:'stretch'}}>
                <StatusBar
                    backgroundColor='rgba(0, 0, 0, 1)'
                    barStyle="default"
                    translucent={true}
                />
                <Navigator
                    initialRoute={{component: IndexPage}}
                    configureScene={HFNavigatorConfig.configureScene}
                    renderScene={HFNavigatorConfig.renderScene}
                />
            </View>
        );
    }
}

module.exports = hfFramework;
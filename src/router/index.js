import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import listJson from './list.json';

function importComponent(componentName, pagePath) {
  let path = [];
  let name = [];
  let component = [];
  componentName.forEach(item => {
    path.push(`/${item.charAt(0).toLowerCase() + item.slice(1)}`);
    name.push(item.charAt(0).toLowerCase() + item.slice(1));
    component.push(() => import(`@/${pagePath}/${item}.vue`));
  });
  return path.map((item, index) => {
    return {
      path: item,
      name: name[index],
      component: component[index],
      meta: { transition: 'fade' },
    }
  });
}

console.log(...importComponent(listJson.component, 'components'));
console.log(...importComponent(listJson.view, 'views'));


const view = [
  ...importComponent(listJson.view, 'views'),
  ...importComponent(listJson.component, 'components'),
  {
    path: '',
    redirect: '/home'  //重定向操作
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView, //主页
  },
];

const router = createRouter({
  // history: createWebHashHistory(import.meta.env.BASE_URL),
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: view,
})

export default router

import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import store from '@/store'
import { i18n } from '@/i18n'
import { pathToCamel } from '@/utils/tool'

NProgress.configure({ showSpinner: false })

const constantRoutes: RouteRecordRaw[] = [
	{
		path: '/redirect',
		component: () => import('../layout/index.vue'),
		children: [
			{
				path: '/redirect/:path(.*)',
				component: () => import('../layout/components/Router/Redirect.vue')
			}
		]
	},
	{
		path: '/login',
		component: () => import('../views/login/login.vue')
	},
	{
		path: '/404',
		component: () => import('../views/404.vue')
	}
]

const asyncRoutes: RouteRecordRaw = {
	path: '/',
	component: () => import('../layout/index.vue'),
	redirect: '/home',
	children: [
		{
			path: '/home',
			name: 'Home',
			component: () => import('../views/home.vue'),
			meta: {
				title: i18n.global.t('router.home'),
				affix: true
			}
		},
		{
			path: '/profile/password',
			name: 'ProfilePassword',
			component: () => import('../views/profile/password.vue'),
			meta: {
				title: i18n.global.t('router.profilePassword'),
				cache: true
			}
		}
	]
}

export const errorRoute: RouteRecordRaw = {
	path: '/:pathMatch(.*)',
	redirect: '/404'
}


export const routerList: RouteRecordRaw[] = [
	{
		path: '',
		component: () => import('../views/sys/user/index.vue'),
		meta: {
			name: "权限管理",
			icon: "icon-safetycertificate",
			id: '1',
			cache: true,
			breadcrumb: [],
			url: '',
		},
		children: [
			{
				path: '/sys/user/index',
				meta: {
					name: "用户管理",
					icon: "icon-user",
					id: '2',
					cache: true,
					breadcrumb: [],
					url: 'sys/user/index'
				},
				component: () => import('../views/sys/user/index.vue')
			},
			{
				path: '/sys/org/index',
				meta: {
					name: "机构管理",
					icon: "icon-team",
					id: '3',
					cache: true,
					breadcrumb: [],
					url: "sys/org/index",
				},
				component: () => import('../views/sys/org/index.vue')
			},
			{
				path: '/sys/post/index',
				meta: {
					name: "岗位管理",
					icon: "icon-addteam",
					id: '4',
					cache: true,
					breadcrumb: [],
					url: "sys/post/index",
				},
				component: () => import('../views/sys/post/index.vue')
			},
			{
				path: '/sys/role/index',
				meta: {
					name: "角色管理",
					icon: "icon-team",
					id: '5',
					cache: true,
					breadcrumb: [],
					url: "sys/role/index",
				},
				component: () => import('../views/sys/role/index.vue')
			},
		]
	},
	{
		path: '',
		component: () => import('../views/sys/user/index.vue'),
		meta: {
			name: "系统设置",
			icon: "icon-setting",
			id: '6',
			cache: true,
			breadcrumb: [],
			url: '',
		},
		children: [
			{
				path: '/sys/menu/index',
				meta: {
					name: "菜单管理",
					icon: "icon-menu",
					id: '7',
					cache: true,
					breadcrumb: [],
					url: "sys/menu/index",
				},
				component: () => import('../views/sys/menu/index.vue')
			},  
		]
	}
]

export const router = createRouter({
	history: createWebHashHistory(),
	routes: constantRoutes
})

// 白名单列表
const whiteList = ['/login']

// 路由加载前
router.beforeEach(async (to, from, next) => {
	NProgress.start()
	if (to.meta.title) {
		document.title = 'SCRM-' + to.meta.title;
	}
	// token存在的情况
	if (store.userStore.token) {
		if (to.path === '/login') {
			next('/home')
		} else {
			// 用户信息不存在，则重新拉取用户等信息
			if (!store.userStore.user.id) {
				await store.userStore.getUserInfoAction()
				await store.userStore.getAuthorityListAction()
				await store.appStore.getDictListAction()
				const menuRoutes = await store.routerStore.getMenuRoutes()

				// 根据后端菜单路由，生成KeepAlive路由
				const keepAliveRoutes = getKeepAliveRoutes(menuRoutes, [])

				// 添加菜单路由
				asyncRoutes.children?.push(...keepAliveRoutes)
				router.addRoute(asyncRoutes)

				// 错误路由
				router.addRoute(errorRoute)

				// 保存路由数据
				store.routerStore.setRoutes(constantRoutes.concat(asyncRoutes))

				next({ ...to, replace: true })
			} else {
				next()
			}
		}
	} else {
		// 没有token的情况下，可以进入白名单
		if (whiteList.indexOf(to.path) > -1) {
			next()
		} else {
			next('/login')
		}
	}
})

// 路由加载后
router.afterEach(() => {
	NProgress.done()
})

// 获取扁平化路由，将多级路由转换成一级路由
export const getKeepAliveRoutes = (rs: RouteRecordRaw[], breadcrumb: string[]): RouteRecordRaw[] => {
	const routerList: RouteRecordRaw[] = []

	rs.forEach((item: any) => {
		if (item.meta.title) {
			breadcrumb.push(item.meta.title)
		}

		if (item.children && item.children.length > 0) {
			routerList.push(...getKeepAliveRoutes(item.children, breadcrumb))
		} else {
			item.meta.breadcrumb.push(...breadcrumb)
			routerList.push(item)
		}

		breadcrumb.pop()
	})
	return routerList
}

// 加载vue组件
const layoutModules = import.meta.glob('/src/views/**/*.vue')

// 根据路径，动态获取vue组件
const getDynamicComponent = (path: string): any => {
	const component = layoutModules[`/src/views/${path}.vue`]
	if (!component) {
		console.error('组件不存在，路径为：', path)
	}
	return component
}

// 根据菜单列表，生成路由数据
export const generateRoutes = (menuList: any): RouteRecordRaw[] => {
	const routerList: RouteRecordRaw[] = []

	menuList.forEach((menu: any) => {
		let component
		let path
		if (menu.children && menu.children.length > 0) {
			component = () => import('@/layout/index.vue')
			path = '/p/' + menu.meta.id
		} else {
			component = getDynamicComponent(menu.meta.url)
			path = '/' + menu.meta.url
		}
		const route: RouteRecordRaw = {
			path: path,
			name: pathToCamel(path),
			component: component,
			children: [],
			meta: {
				title: menu.meta.name,
				icon: menu.meta.icon,
				id: '' + menu.id,
				cache: true,
				_blank: menu.openStyle === 1,
				breadcrumb: []
			}
		}

		// 有子菜单的情况
		if (menu.children && menu.children.length > 0) {
			route.children?.push(...generateRoutes(menu.children))
		}

		routerList.push(route)
	})

	return routerList
}

import { defineStore } from 'pinia'
import { useMenuNavApi } from '@/api/menu'
import { generateRoutes, routerList } from '@/router'
import { RouteRecordRaw } from 'vue-router'

export const routerStore = defineStore('routerStore', {
	state: () => ({
		menuRoutes: [] as RouteRecordRaw[],
		routes: [] as RouteRecordRaw[]
	}),
	actions: {
		async getMenuRoutes() {
			// const { data } = await useMenuNavApi()

			const routes = generateRoutes(routerList)

			this.menuRoutes.push(...routes)
			
			return this.menuRoutes
		},
		setRoutes(routers: RouteRecordRaw[]) {
			this.routes = routers
		}
	}
})

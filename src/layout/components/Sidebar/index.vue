<template>
	<el-aside class="layout-sidebar" :class="sidebarClass">
		<div class="logo">Fast Admin</div>
		<Menu />
	</el-aside>
</template>

<script setup lang="ts">
import store from '@/store'
import Menu from './components/Menu.vue'
import { computed } from 'vue'

const sidebarClass = computed(() => {
	const sidebarOpened = store.appStore.sidebarOpened ? 'aside-expend' : 'aside-compress'
	const isDark = store.appStore.theme.sidebarStyle === 'dark' ? 'sidebar-dark' : ''
	return sidebarOpened + ' ' + isDark
})
</script>
<style lang="scss" scoped>
.logo {
	margin-left: 10px;
	width: var(--theme-aside-width) !important;
	height: var(--theme-header-height);
	line-height: var(--theme-header-height);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: rgb(0 21 41 / 2%) 0 1px 4px;
	color: var(--theme-logo-text-color);
	font-size: 18px;
}
</style>
<script setup lang='ts'>
import { computed, ref } from 'vue'
import { NButton, NInput, NModal, useMessage } from 'naive-ui'
import { fetchReg, fetchLogin } from '@/api'
import { useAuthStore,useUserStore } from '@/store'
import Icon403 from '@/icons/403.vue'
 
interface Props {
  visible: boolean
}

defineProps<Props>()
let userStore = useUserStore()
 
const authStore = useAuthStore()

const ms = useMessage()

const loading = ref(false)

const breg = ref(false)
const username = ref('')
const password = ref('')
const name = ref('')
const tel = ref('')
const token = ref(username.value + "*" + password.value);
const disabled = computed(() => !token.value.trim() || loading.value)


async function handlereg() {
  const us = username.value.trim()
  const pa = password.value.trim()
  const na = name.value.trim()
  const tl = tel.value.trim()

  if (!us || !pa)
    return

  try {
    loading.value = true
    await fetchReg(us, pa, na, tl)
    ms.success('success')
    window.location.reload()
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    authStore.removeToken()
    token.value = ''
  }
  finally {
    loading.value = false
  }
}


async function handlelogin() {
  const us = username.value.trim()
  const pa = password.value.trim()

  if (!us || !pa)
    return

  try {
    loading.value = true
    const { token } = await fetchLogin(us, pa)
    console.log(token)
    if (token)
      authStore.setToken(token)
    ms.success('success')
    userStore.userInfo.name = us
    userStore.updateUserInfo(userStore.userInfo)
    window.location.reload()
  }
  catch (error: any) {
    ms.error(error.message ?? 'error')
    authStore.removeToken()
    token.value = ''
  }
  finally {
    loading.value = false
  }
}

</script>

<template>
  <NModal :show="visible" style="width: 90%; max-width: 640px">
    <div class="p-10 bg-white rounded dark:bg-slate-800">
      <div class="space-y-4">
        <header class="space-y-2">
          <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
            用户登录
          </h2>
          <p class="text-base text-center text-slate-500 dark:text-slate-500">
            <!-- {{ $t('common.unauthorizedTips') }} -->
            用户信息请联系管理员
          </p>
          <Icon403 class="w-[200px] m-auto" />
        </header>

        <div v-show="breg">
          姓名
          <NInput v-model:value="name" type="text" placeholder="" />
          手机号
          <NInput v-model:value="tel" type="text" placeholder="" />
        </div>
        用户名
        <NInput v-model:value="username" type="text" placeholder="" />
        密码
        <NInput v-model:value="password" type="password" placeholder="" />
        <!-- <NInput v-model:value="token" type="password" placeholder="" @keypress="handlePress" /> -->
        <NButton v-show="!breg" block type="primary" :disabled="disabled" :loading="loading" @click="handlelogin">
          登录
        </NButton>
        <!-- <NButton block v-show="!breg" type="primary" :disabled="disabled" :loading="loading" @click="breg = !breg">
              注册
            </NButton> -->
        <NButton block v-show="breg" type="primary" :disabled="disabled" :loading="loading" @click="breg = !breg">
          返回登录
        </NButton>
        <NButton block v-show="breg" type="primary" :disabled="disabled" :loading="loading" @click="handlereg">
          注册
        </NButton>
      </div>
    </div>
  </NModal>
</template>

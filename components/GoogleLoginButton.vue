<template>
  <div :id="containerId" :style="{ width: width }"></div>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useGoogleLogin } from '../composables/useGoogleLogin';

const props = defineProps<{
  clientId: string;
  containerId?: string;
  width?: string;
  theme?: 'outline' | 'filled_blue' | 'filled_black';
}>();

const emit = defineEmits<{
  (e: 'success', token: string): void;
  (e: 'error', msg: string): void;
}>();

const containerId = props.containerId || 'google-btn-container';

const handleCredentialResponse = (response: any) => {
  if (response.credential) {
    emit('success', response.credential);
  } else {
    emit('error', 'Failed to get credentials');
  }
};

const { isReady, renderButton } = useGoogleLogin(props.clientId, handleCredentialResponse);

const render = () => {
  renderButton(containerId, {
    theme: props.theme || 'outline',
    size: 'large',
    width: props.width,
    type: 'standard',
    shape: 'pill',
    text: 'continue_with',
    logo_alignment: 'left'
  });
};

watch(isReady, (ready) => {
  if (ready) {
    render();
  }
});

onMounted(() => {
  if (isReady.value) {
    render();
  }
});
</script>

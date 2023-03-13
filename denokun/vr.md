---
title: VR
layout: denokun/page.njk
---

[A-Frame](https://aframe.io/)を使って展覧会風にする

<img src="/denokun/img/vr.jpg" width="640" />

``index.html``
```html
<head>
  <script src="https://aframe.io/releases/1.2.0/aframe.js"></script>
  <script src="https://unpkg.com/aframe-environment-component@1.2.0/dist/aframe-environment-component.js"></script>
</head>

<body class="bg-blue-200">
  <div x-data="app" x-cloak>
    <a-scene x-show="showVR">
      <a-entity environment="preset:checkerboard"></a-entity>
      <a-camera position="0 1.6 10"></a-camera>
      <a-box color="white" :width="timeline.length * 2" height="3" depth="0.2" position="0 1.5 -0.5">
        <template x-for="(photo, idx) in timeline">
          <a-image
            width="1"
            height="1"
            rotation="0 0 0"
            :position="idx * 2 - (timeline.length - 1) + ' 0 0.11'"
            :src="photo.url"
          ></a-image>
        </template>
      </a-box>
    </a-scene>

    <div class="bg-blue-400 text-center fixed top-0 w-full p-1">
      <button @click="showVR = !showVR" :class="buttonStyle">VR</button>
    </div>
  </div>

  <script type="module">
    Alpine.data("app", () => ({
      // VR
      showVR: true
    }));
  </script>
</body>
```

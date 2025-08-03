<template>
  <footer class="app-footer">
    <div class="footer-waves">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>

    <div class="container footer-content">
      <div class="footer-grid">
        <!-- 研究所信息 -->
        <div class="footer-section institute-info">
          <div class="footer-logo">
            <div class="logo-icon">
              <span class="dna-helix dna-strand-1"></span>
              <span class="dna-helix dna-strand-2"></span>
            </div>
            <h2>{{ $t('global.title') }}</h2>
          </div>
          <p>{{ $t('footer.instituteDescription') }}</p>
        </div>

        <!-- 联系信息 -->
        <div class="footer-section contact-info">
          <h3 class="tech-line">{{ $t('footer.contactUs') }}</h3>
          <ul class="contact-list">
            <li>
              <el-icon><Location /></el-icon>
              <div class="address-info">
                <span>{{ $t('footer.addressValue') }}</span>
                <span class="postal-code">{{ $t('footer.postalCode') }}</span>
              </div>
            </li>
            <li>
              <el-icon><Message /></el-icon>
              <span>{{ $t('footer.emailValue') }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="copyright">
          {{ $t('footer.copyright') }}
        </div>
        <!-- <div class="footer-links">
          <a href="#">{{ $t('footer.privacyPolicy') }}</a>
          <a href="#">{{ $t('footer.termsOfUse') }}</a>
          <a href="#">{{ $t('footer.accessibility') }}</a>
        </div> -->
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Location, Message } from '@element-plus/icons-vue'
</script>

<style lang="less" scoped>
.app-footer {
  position: relative;
  background: var(--dark-color);
  color: var(--light-color);
  padding-top: 120px;
  overflow: hidden;

  .dark-mode & {
    background: darken(@dark-background, 5%);
  }
}

.footer-waves {
  position: absolute;
  top: -100px;
  left: 0;
  width: 100%;
  height: 100px;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%231A1A2E" fill-opacity="1" d="M0,192L60,176C120,160,240,128,360,138.7C480,149,600,203,720,208C840,213,960,171,1080,149.3C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>') no-repeat;
  background-size: cover;
  background-position: center bottom;

  .dark-mode & {
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23121225" fill-opacity="1" d="M0,192L60,176C120,160,240,128,360,138.7C480,149,600,203,720,208C840,213,960,171,1080,149.3C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>') no-repeat;
  }

  &.wave1 {
    animation: wave 15s linear infinite;
  }

  &.wave2 {
    bottom: 10px;
    opacity: 0.5;
    animation: wave 20s linear infinite reverse;
  }

  &.wave3 {
    bottom: 20px;
    opacity: 0.2;
    animation: wave 30s linear infinite;
  }
}

@keyframes wave {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(-25%);
  }
  100% {
    transform: translateX(0);
  }
}

.footer-content {
  position: relative;
  z-index: 10;
  padding-bottom: 30px;
  backdrop-filter: blur(10px);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  margin-bottom: 50px;

  @media (max-width: @tablet-breakpoint) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

.footer-section {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  h3 {
    font-size: 1.4rem;
    margin-bottom: 25px;
    position: relative;
    display: inline-block;
    color: var(--primary-color);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      width: 30px;
      height: 2px;
      background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      border-radius: 1px;
    }
  }
}

.institute-info {
  .footer-logo {
    display: flex;
    align-items: center;
    margin-bottom: 25px;

    h2 {
      font-size: 1.6rem;
      margin: 0;
      margin-left: 12px;
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 600;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      position: relative;

      .dna-helix {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;

        &.dna-strand-1 {
          border-left: 3px solid var(--primary-color);
          border-right: 3px solid var(--accent-color);
          animation: dnaRotate 10s linear infinite;
        }

        &.dna-strand-2 {
          border-top: 3px solid var(--primary-color);
          border-bottom: 3px solid var(--accent-color);
          animation: dnaRotate 10s linear infinite reverse;
        }
      }
    }
  }

  p {
    opacity: 0.85;
    line-height: 1.7;
    font-size: 1rem;
    margin-bottom: 20px;
  }
}

.contact-info {
  h3 {
    color: var(--primary-color);
    font-weight: 600;
  }
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 18px;
    display: flex;
    align-items: flex-start;
    padding: 8px 0;
    transition: all 0.3s ease;

    .el-icon {
      margin-right: 15px;
      margin-top: 2px;
      font-size: 22px;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    span {
      opacity: 0.85;
      font-size: 0.95rem;
    }

    .address-info {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .postal-code {
        font-size: 0.85rem;
        opacity: 0.7;
        font-weight: 500;
      }
    }
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  .dark-mode & {
    border-top: 1px solid rgba(247, 247, 255, 0.15);
  }

  @media (max-width: @tablet-breakpoint) {
    flex-direction: column;
    text-align: center;

    .copyright {
      margin-bottom: 15px;
    }
  }
}

.copyright {
  opacity: 0.9;
  font-size: 0.9rem;
  color: var(--light-color);

  .dark-mode & {
    color: rgba(247, 247, 255, 0.9);
  }
}

.footer-links {
  display: flex;
  gap: 20px;

  a {
    color: var(--light-color);
    opacity: 0.8;
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    .dark-mode & {
      color: rgba(247, 247, 255, 0.8);
    }

    &:hover {
      opacity: 1;
      color: var(--primary-color);
    }
  }

  @media (max-width: @mobile-breakpoint) {
    flex-direction: column;
    gap: 10px;
  }
}
</style>

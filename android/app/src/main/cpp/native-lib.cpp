// Startet Node.js in der App (29.09.2026). Nach dem Beispiel von
// nodejs-mobile (MIT-Lizenz, Janea Systems und Mitwirkende): Node braucht
// alle Argumente am Stueck im Speicher, und seine Ausgabe geht ins
// Android-Protokoll (logcat, Kennung "TRAINER-NODE").
#include <jni.h>
#include <string>
#include <cstdlib>
#include <cstring>
#include <pthread.h>
#include <unistd.h>
#include <android/log.h>
#include "node.h"

static int pipe_stdout[2];
static int pipe_stderr[2];
static const char *TAG = "TRAINER-NODE";

static void *lesen(void *arg) {
    int *p = (int *) arg;
    int prio = (p == pipe_stderr) ? ANDROID_LOG_ERROR : ANDROID_LOG_INFO;
    char buf[2048];
    ssize_t n;
    while ((n = read(p[0], buf, sizeof buf - 1)) > 0) {
        if (buf[n - 1] == '\n') --n;
        buf[n] = 0;
        __android_log_write(prio, TAG, buf);
    }
    return 0;
}

static void ausgabeUmleiten() {
    setvbuf(stdout, 0, _IONBF, 0);
    setvbuf(stderr, 0, _IONBF, 0);
    pipe(pipe_stdout);
    pipe(pipe_stderr);
    dup2(pipe_stdout[1], STDOUT_FILENO);
    dup2(pipe_stderr[1], STDERR_FILENO);
    pthread_t a, b;
    if (pthread_create(&a, 0, lesen, pipe_stdout) == 0) pthread_detach(a);
    if (pthread_create(&b, 0, lesen, pipe_stderr) == 0) pthread_detach(b);
}

extern "C" JNIEXPORT jint JNICALL
Java_com_amateurfunktrainer_app_NodeStarter_startNode(JNIEnv *env, jclass, jobjectArray arguments) {
    jsize anzahl = env->GetArrayLength(arguments);
    size_t groesse = 0;
    for (jsize i = 0; i < anzahl; i++) {
        jstring s = (jstring) env->GetObjectArrayElement(arguments, i);
        const char *c = env->GetStringUTFChars(s, 0);
        groesse += strlen(c) + 1;
        env->ReleaseStringUTFChars(s, c);
    }
    char *puffer = (char *) calloc(groesse, sizeof(char));
    char **argv = (char **) calloc(anzahl + 1, sizeof(char *));
    char *pos = puffer;
    for (jsize i = 0; i < anzahl; i++) {
        jstring s = (jstring) env->GetObjectArrayElement(arguments, i);
        const char *c = env->GetStringUTFChars(s, 0);
        size_t l = strlen(c);
        memcpy(pos, c, l);
        argv[i] = pos;
        pos += l + 1;
        env->ReleaseStringUTFChars(s, c);
    }
    ausgabeUmleiten();
    return jint(node::Start(anzahl, argv));
}

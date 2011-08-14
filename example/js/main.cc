/*
 * This define is for Windows only, it is a work-around for bug 661663.
 */
#ifdef _MSC_VER
# define XP_WIN
#endif

/* Include the JSAPI header file to get access to SpiderMonkey. */
#include "jsapi.h"
#include "WebGL.h"

#include <fstream>

/* The class of the global object. */
static JSClass global_class = {
    "global", JSCLASS_GLOBAL_FLAGS,
    JS_PropertyStub, JS_PropertyStub, JS_PropertyStub, JS_StrictPropertyStub,
    JS_EnumerateStub, JS_ResolveStub, JS_ConvertStub, JS_FinalizeStub,
    JSCLASS_NO_OPTIONAL_MEMBERS
};

/* The error reporter callback. */
void reportError(JSContext *cx, const char *message, JSErrorReport *report)
{
    cout << "WEBGL ERROR:" << report->filename << ":" << report->lineno << endl << "\t'" << message << "'" << endl;
}

int main(int argc, const char *argv[])
{

    if (argc < 2) {
        cout << "Usage: webgljs path/to/app.js" << endl;
        return 1;
    }

    const char *filename = argv[1];

    cout << "WEGBL: Loading " <<  filename << endl;

    ifstream scriptStream(filename, ios::in);
    if (scriptStream.is_open() == false) {
        cout << "WEGBL: Unable to open '" << filename << "' for reading" << endl;
        return 1;
    }


    scriptStream.seekg (0, ios::end);
    int size = (int)scriptStream.tellg();
    if (size == 0) {
        cout << "WEGBL: this file is empty, aborting" << endl;
    }
    cout << "WEBGL: Loaded script (" << size << " bytes)" << endl;

    scriptStream.seekg (0, ios::beg);
    char *script = new char [size+1];
    scriptStream.read(script, size);
    scriptStream.close();
    script[size] = 0;

    /* JSAPI variables. */
    JSRuntime *rt;
    JSContext *cx;
    JSObject  *global;

    /* Create a JS runtime. You always need at least one runtime per process. */
    rt = JS_NewRuntime(8 * 1024 * 1024);
    if (rt == NULL)
        return 1;

    /* Create a context. You always need a context per thread. */
    cx = JS_NewContext(rt, 8192);
    if (cx == NULL)
        return 1;
    JS_SetOptions(cx, JSOPTION_VAROBJFIX | JSOPTION_JIT | JSOPTION_METHODJIT);
    JS_SetVersion(cx, JSVERSION_LATEST);
    JS_SetErrorReporter(cx, reportError);

    /*
     * Create the global object in a new compartment.
     * You always need a global object per context.
     */
    global = JS_NewCompartmentAndGlobalObject(cx, &global_class, NULL);
    if (global == NULL)
        return 1;

    /*
     * Populate the global object with the standard JavaScript
     * function and object classes, such as Object, Array, Date.
     */
    if (!JS_InitStandardClasses(cx, global))
        return 1;

    /* Your application code here. This may include JSAPI calls
     * to create your own custom JavaScript objects and to run scripts.
     *
     * The following example code creates a literal JavaScript script,
     * evaluates it, and prints the result to stdout.
     *
     * Errors are conventionally saved in a JSBool variable named ok.
     */
    //char *script = "'Hello ' + 'World!'";
    jsval rval;
    JSString *str;
    JSBool ok;
    uintN lineno = 0;

    ok = JS_EvaluateScript(cx, global, script, strlen(script),
                           filename, lineno, &rval);
    if (rval == NULL || rval == JS_FALSE)
        return 1;

    str = JS_ValueToString(cx, rval);
    printf("OUTPUT: %s\n", JS_EncodeString(cx, str));

    /* End of your application code */

    /* Clean things up and shut down SpiderMonkey. */
    JS_DestroyContext(cx);
    JS_DestroyRuntime(rt);
    JS_ShutDown();
    delete [] script;
    return 0;
}
#import "Fold.h"

#import <UIKit/UIKit.h>

@interface Fold ()
@property (nonatomic, copy) NSDictionary *lastState;
@property (nonatomic, strong) id hingeInteraction;
@property (nonatomic, assign) NSInteger attachAttempts;
@end

@implementation Fold

- (instancetype)init
{
  if (self = [super init]) {
    _lastState = [Fold absentState];
    _attachAttempts = 0;
    if (@available(iOS 27.1, *)) {
      __weak __typeof(self) weakSelf = self;
      dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf attachHinge];
      });
    }
  }
  return self;
}

+ (NSDictionary *)absentState
{
  return @{
    @"isPresent": @(NO),
    @"isSeparating": @(NO),
    @"isHalfOpened": @(NO),
    @"orientation": @"vertical",
    @"x": @(0),
    @"y": @(0),
    @"width": @(0),
    @"height": @(0)
  };
}

- (UIWindow *)keyWindow
{
  for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
    if (![scene isKindOfClass:UIWindowScene.class]) {
      continue;
    }
    UIWindowScene *windowScene = (UIWindowScene *)scene;
    for (UIWindow *window in windowScene.windows) {
      if (window.isKeyWindow) {
        return window;
      }
    }
    if (windowScene.windows.firstObject != nil) {
      return windowScene.windows.firstObject;
    }
  }
  return nil;
}

- (void)attachHinge API_AVAILABLE(ios(27.1))
{
  UIWindow *host = [self keyWindow];
  if (host == nil) {
    if (self.attachAttempts >= 20) {
      return;
    }
    self.attachAttempts += 1;
    __weak __typeof(self) weakSelf = self;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      [weakSelf attachHinge];
    });
    return;
  }

  __weak __typeof(self) weakSelf = self;
  UIHingeInteraction *interaction =
    [[UIHingeInteraction alloc] initWithUpdateHandler:^(UIHingeInteraction *i, UIHingeInteractionUpdate *update) {
      [weakSelf handleUpdate:update];
    }];
  self.hingeInteraction = interaction;
  [host addInteraction:interaction];
}

- (void)handleUpdate:(UIHingeInteractionUpdate *)update API_AVAILABLE(ios(27.1))
{
  UIHinge *hinge = update.hinge;
  NSDictionary *state;
  if (hinge == nil || hinge.status == UIHingeStatusUnknown) {
    state = [Fold absentState];
  } else {
    BOOL isHalfOpened = (hinge.status == UIHingeStatusPartiallyOpen);
    state = @{
      @"isPresent": @(YES),
      @"isSeparating": @(isHalfOpened),
      @"isHalfOpened": @(isHalfOpened),
      @"orientation": @"vertical",
      @"x": @(0),
      @"y": @(0),
      @"width": @(0),
      @"height": @(0)
    };
  }
  self.lastState = state;
  [self emitOnFoldChange:state];
}

- (NSDictionary *)getFoldState
{
  return self.lastState;
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeFoldSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"Fold";
}

@end

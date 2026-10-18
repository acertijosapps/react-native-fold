#import "Fold.h"

#import <UIKit/UIKit.h>

#if __has_include(<UIKit/UIHingeInteraction.h>) && __has_include(<UIKit/UIViewReservedRegion.h>)
#define FOLD_HAS_HINGE_SDK 1
#else
#define FOLD_HAS_HINGE_SDK 0
#endif

@interface FoldHostView : UIView
@property (nonatomic, copy) void (^onLayout)(void);
@end

@implementation FoldHostView

- (void)layoutSubviews
{
  [super layoutSubviews];
  if (self.onLayout != nil) {
    self.onLayout();
  }
}

@end

@interface Fold ()
@property (atomic, copy) NSDictionary *lastState;
@property (nonatomic, strong) FoldHostView *hostView;
@property (nonatomic, strong) id hingeInteraction;
@property (nonatomic, strong) id hinge;
@property (nonatomic, assign) NSInteger attachAttempts;
@property (nonatomic, assign) BOOL isInvalidated;
@end

@implementation Fold

- (instancetype)init
{
  if (self = [super init]) {
    _lastState = [Fold absentState];
    _attachAttempts = 0;
#if FOLD_HAS_HINGE_SDK
    if (@available(iOS 27.1, *)) {
      __weak __typeof(self) weakSelf = self;
      dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf attachHinge];
      });
    }
#endif
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

#if FOLD_HAS_HINGE_SDK

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
  if (self.isInvalidated) {
    return;
  }
  UIWindow *window = [self keyWindow];
  if (window == nil) {
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
  FoldHostView *hostView = [[FoldHostView alloc] initWithFrame:window.bounds];
  hostView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
  hostView.userInteractionEnabled = NO;
  hostView.backgroundColor = UIColor.clearColor;
  hostView.onLayout = ^{
    [weakSelf refreshState];
  };
  self.hostView = hostView;
  [window insertSubview:hostView atIndex:0];

  UIHingeInteraction *interaction =
    [[UIHingeInteraction alloc] initWithUpdateHandler:^(UIHingeInteraction *i, UIHingeInteractionUpdate *update) {
      weakSelf.hinge = update.hinge;
      [weakSelf refreshState];
    }];
  self.hingeInteraction = interaction;
  [hostView addInteraction:interaction];
}

- (void)refreshState API_AVAILABLE(ios(27.1))
{
  NSDictionary *state = [self currentState];
  if ([state isEqualToDictionary:self.lastState]) {
    return;
  }
  self.lastState = state;
  [self emitOnFoldChange:state];
}

- (NSDictionary *)currentState API_AVAILABLE(ios(27.1))
{
  UIHinge *hinge = self.hinge;
  UIView *view = self.hostView;
  if (hinge == nil || hinge.status == UIHingeStatusUnknown || view.window == nil) {
    return [Fold absentState];
  }

  NSArray<UIViewReservedRegion *> *regions =
    [view reservedRegionsOfKind:[UIViewReservedRegionKind divisionRegionKind]
                        options:UIViewReservedRegionQueryOptionsIncludeInactive];
  UIViewReservedRegion *region = regions.firstObject;
  for (UIViewReservedRegion *candidate in regions) {
    if (candidate.isActive) {
      region = candidate;
      break;
    }
  }
  if (region == nil) {
    return [Fold absentState];
  }

  CGRect frame = region.frame;
  return @{
    @"isPresent": @(YES),
    @"isSeparating": @(region.isActive),
    @"isHalfOpened": @(hinge.status == UIHingeStatusPartiallyOpen),
    @"orientation": CGRectGetHeight(frame) >= CGRectGetWidth(frame) ? @"vertical" : @"horizontal",
    @"x": @(CGRectGetMinX(frame)),
    @"y": @(CGRectGetMinY(frame)),
    @"width": @(CGRectGetWidth(frame)),
    @"height": @(CGRectGetHeight(frame))
  };
}

#endif

- (void)invalidate
{
  dispatch_async(dispatch_get_main_queue(), ^{
    self.isInvalidated = YES;
    FoldHostView *hostView = self.hostView;
    hostView.onLayout = nil;
    if (self.hingeInteraction != nil) {
      [hostView removeInteraction:self.hingeInteraction];
    }
    [hostView removeFromSuperview];
    self.hostView = nil;
    self.hingeInteraction = nil;
    self.hinge = nil;
  });
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
